# TodoApp
React、TypeScript、Tailwind CSS を使用し、ローカルストレージでデータを永続化した「Todoアプリ」です。

# 概要
このTodo Appは、タスク管理と効率的な作業選択を支援する React ベースのウェブアプリケーションです。タスクの追加、管理、優先順位付け、期限設定、そしてランダムタスク抽選機能を提供します。
# 主な機能
* ## タスク管理
  * タスクの追加、編集、削除
  * タスクに優先度（0-10）と期限を設定可能
  * タスクを「期限切れ」「未完了」「完了済み」に自動分類

* ## ソートと整理
  * 日付順または優先度順でタスクをソート
  * 各カテゴリ（期限切れ、未完了、完了済み）で異なるソート方法を選択可能

* ## 今日のタスク機能
  * 「今日やるタスク」セクションで、その日に取り組むタスクを管理
  *  一日の残り時間をリアルタイムで表示

* ## タスク抽選機能
  * ランダムにタスクを選択する独自の抽選モーダル
  * 未完了タスクや期限切れタスクから抽選可能
  * 重複を避けるスマートな抽選アルゴリズム

# 技術的な工夫
* ## データ永続化
  * LocalStorageを使用してタスクデータを保存
  * タスクの状態を自動的に保持し、ページリロード後も維持

* ## UI/UX の改善
  * レスポンシブデザイン (モバイル・デスクトップ両対応)
  * Tailwind CSSでスタイリング
  * Font Awesomeアイコンによる直感的なインターフェース

* ## バリデーションと使いやすさ
  * タスク名の長さを2-32文字に制限
  * 入力エラー時のわかりやすいフィードバック
  * 優先度をビジュアル的に★で表現

# 開発履歴
- 2024年11月21日：プロジェクト開始
- 2024年11月26日：デプロイ

# ライセンス

MIT License

Copyright (c) 2024 yuga-school

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
