import os
import re
import pandas as pd

# このファイルと同じフォルダにあるCSVを読む
DATA_DIR = os.path.dirname(os.path.abspath(__file__))

FILES = {
    'batter':  ['npb_2005_2027_central_batting.csv',  'npb_2005_2027_pacific_batting.csv'],
    'pitcher': ['npb_2005_2027_central_pitting.csv', 'npb_2005_2027_pacific_pitting.csv'],
}

# 空白を除いたCSVの表記 -> team_id
TEAM_KEY = {
    '阪神': 'hanshin',
    '巨人': 'giants',
    'ヤクルト': 'yakult',
    '広島': 'carp',
    'DeNA': 'dena',
    '横浜': 'dena',
    '中日': 'chunichi',
    'ソフトバンク': 'hawks',
    '日本ハム': 'fighters',
    'ロッテ': 'marines',
    '西武': 'lions',
    '楽天': 'eagles',
    'オリックス': 'buffaloes',
}

# グラフの凡例に出す名前
TEAM_LABEL = {
    'hanshin': '阪神',
    'giants': '巨人',
    'yakult': 'ヤクルト',
    'carp': '広島',
    'dena': 'DeNA(横浜)',
    'chunichi': '中日',
    'hawks': 'ソフトバンク',
    'fighters': '日本ハム',
    'marines': 'ロッテ',
    'lions': '西武',
    'eagles': '楽天',
    'buffaloes': 'オリックス',
}


def load_team_df(player_type):
    """セ・パのCSVを結合し、チーム名を team_id に変換して返す"""
    dfs = [
        pd.read_csv(os.path.join(DATA_DIR, f), encoding='utf-8-sig')
        for f in FILES[player_type]
    ]
    df = pd.concat(dfs, ignore_index=True)

    df['年度'] = pd.to_numeric(df['年度'], errors='coerce')

    # 半角・全角スペースをすべて除去してから team_id に変換
    df['チーム'] = df['チーム'].astype(str).apply(lambda s: re.sub(r'\s+', '', s))
    df['team_id'] = df['チーム'].map(TEAM_KEY)

    # 投球回: 整数部 + 見出しが空の列(.1=1/3回, .2=2/3回)
    if player_type == 'pitcher' and 'Unnamed: 15' in df.columns:
        frac = pd.to_numeric(df['Unnamed: 15'], errors='coerce').fillna(0)
        df['投球回'] = pd.to_numeric(df['投球回'], errors='coerce').fillna(0) + frac * 10 / 3
        df = df.drop(columns=['Unnamed: 15'])

    return df


def analysis_items(df):
    """分析項目として選べる列名の一覧"""
    return [c for c in df.columns if c not in ('年度', 'チーム', 'team_id')]