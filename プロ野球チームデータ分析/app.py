import json
import pandas as pd
from flask import Flask, render_template, request, jsonify

from npb_data import load_team_df, analysis_items, TEAM_LABEL

app = Flask(__name__)


def to_float(v):
    """数値に変換。変換できなければ None（グラフ上で線が途切れる）"""
    x = pd.to_numeric(v, errors='coerce')
    return None if pd.isna(x) else float(x)


@app.route('/')
def index():
    df = load_team_df('batter')
    years = sorted(df['年度'].dropna().astype(int).unique().tolist())
    return render_template('index.html', items=analysis_items(df), years=years)


@app.route('/get_items', methods=['GET'])
def get_items():
    player_type = request.args.get('player_type', 'batter')
    try:
        return jsonify(analysis_items(load_team_df(player_type)))
    except Exception as e:
        print(f"項目取得エラー: {e}")
        return jsonify([])


@app.route('/analyze', methods=['POST'])
def analyze():
    selected_items = request.form.getlist('items')
    player_type = request.form.get('player_type', 'batter')
    selected_team_ids = request.form.getlist('team_ids')
    start_year = int(request.form.get('start_year', 2005))
    end_year = int(request.form.get('end_year', 2026))

    if len(selected_items) > 2:
        return "分析項目は２つまで選択してください"
    if start_year > end_year:
        return "開始年度は終了年度以下にしてください"

    df = load_team_df(player_type)
    df = df[(df['年度'] >= start_year) & (df['年度'] <= end_year)]

    all_years = list(range(start_year, end_year + 1))
    datasets = []

    for team_id in selected_team_ids:
        # 1球団×1年＝1行なので、年度をインデックスにして直接取り出す
        team_df = df[df['team_id'] == team_id].drop_duplicates('年度').set_index('年度')
        if team_df.empty:
            continue

        for index, item in enumerate(selected_items):
            if item not in team_df.columns:
                continue

            values = []
            team_names = []
            for y in all_years:
                if y in team_df.index:
                    values.append(to_float(team_df.at[y, item]))
                    team_names.append(str(team_df.at[y, 'チーム']))
                else:
                    values.append(None)
                    team_names.append("")

            datasets.append({
                'label': f"{TEAM_LABEL[team_id]} ({item})",
                'data': values,
                'teamList': team_names,
                'item': item,
                'type': 'line' if index == 1 else 'bar',
                'fill': False,
                'tension': 0.1,
                'spanGaps': True,
            })

    return render_template(
        'visualization.html',
        item=selected_items,
        items_json=json.dumps(selected_items, ensure_ascii=False),
        labels=json.dumps([str(y) for y in all_years]),
        datasets=json.dumps(datasets, ensure_ascii=False),
    )


if __name__ == '__main__':
    app.run(debug=True)