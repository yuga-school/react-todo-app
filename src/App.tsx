import { useState, useEffect } from "react";
import { Todo } from "./types";
import { initTodos } from "./initTodos";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(10);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoNameError, setNewTodoNameError] = useState("");
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]); // 「今日やるタスク」のリスト
  const [resulttodo, setresulttodo] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // モーダル表示の管理
  const [includeUncompleted, setIncludeUncompleted] = useState(false); // 未完了タスクを抽選に含むか
  const [includeExpired, setIncludeExpired] = useState(false); // 期限切れタスクを抽選に含むか
  const [initialized, setInitialized] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0); // 残り秒数を保存
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const localStorageKey = "TodoApp";
  // App コンポーネントの初回実行時のみLocalStorageからTodoデータを復元
  useEffect(() => {
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr && todoJsonStr !== "[]") {
      const storedTodos: Todo[] = JSON.parse(todoJsonStr);
      const convertedTodos = storedTodos.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
      }));
      setTodos(convertedTodos);
    } else {
      setTodos(initTodos);
    }
    const todayTodosJsonStr = localStorage.getItem("TodayTodos");
    if (todayTodosJsonStr) {
      const storedTodayTodos: Todo[] = JSON.parse(todayTodosJsonStr);
      setTodayTodos(storedTodayTodos);
    }
    setInitialized(true);
  }, []);
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(localStorageKey, JSON.stringify(todos));
      localStorage.setItem("TodayTodos", JSON.stringify(todayTodos));
    }
  }, [todos, todayTodos, initialized]);
  // 残り時間を計算し、毎秒更新する
  useEffect(() => {
    const updateRemainingTime = () => {
      const remainingTimeInSeconds = dayjs()
        .endOf("day")
        .diff(dayjs(), "second");
      setRemainingTime(remainingTimeInSeconds);

      // 残り時間が0以下になったらタスクをリセット
      if (remainingTimeInSeconds <= 0) {
        setTodayTodos([]);
      }
    };

    // 初期残り時間設定
    updateRemainingTime();

    // 1秒ごとに残り時間を更新
    const intervalId = setInterval(updateRemainingTime, 1000);

    // コンポーネントのアンマウント時に interval をクリア
    return () => clearInterval(intervalId);
  }, []); // 空の依存配列で1回のみ実行
  const closeVideoModal = () => {
    setIsVideoModalOpen(false); // ビデオモーダルを閉じる
    setresulttodo([]);
  };
  const openVideoModal = () => {
    setIsVideoModalOpen(true); // ビデオモーダルを閉じる
    drawRandomTask();
  };
  // タスクのセクション分け
  const expiredTodos = todos.filter(
    (todo) =>
      todo.deadline &&
      new Date(todo.deadline).getTime() < new Date().getTime() &&
      !todo.isDone
  );
  const uncompletedTodos = todos.filter(
    (todo) =>
      !todo.isDone &&
      (!todo.deadline ||
        new Date(todo.deadline).getTime() >= new Date().getTime())
  );
  const drawRandomTask = () => {
    const candidates = [
      ...(includeUncompleted ? uncompletedTodos : []),
      ...(includeExpired ? expiredTodos : []),
    ];
    if (candidates.length === 0) return;
    const availableTasks = candidates.filter(
      (candidate) => !todayTodos.some((todo) => todo.id === candidate.id)
    );
    if (availableTasks.length === 0) return;
    const randomTask =
      availableTasks[Math.floor(Math.random() * availableTasks.length)];
    setTodayTodos((prev) => [...prev, randomTask]);
    setIsModalOpen(false);
    setresulttodo([randomTask]);
  };
  const completedTodos = todos.filter((todo) => todo.isDone);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  // 各セクションのソート状態を管理
  const [expiredSort, setExpiredSort] = useState<"date" | "priority">("date");
  const [uncompletedSort, setUncompletedSort] = useState<"date" | "priority">(
    "date"
  );
  const [completedSort, setCompletedSort] = useState<"date" | "priority">(
    "date"
  );

  // ソート関数
  const sortTodos = (todos: Todo[], sortType: "date" | "priority") => {
    if (sortType === "date") {
      return [...todos].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0; // 両方とも日付がない場合は順序を変更しない
        if (!a.deadline) return 1; // aの日付がない場合は後ろにする
        if (!b.deadline) return -1; // bの日付がない場合は後ろにする
        return a.deadline.getTime() - b.deadline.getTime(); // 日付がある場合は昇順にソート
      });
    } else if (sortType === "priority") {
      return [...todos].sort((a, b) => b.priority - a.priority);
    }
    return todos;
  };
  const sortedTodayTodos = todayTodos.sort(
    (a, b) => Number(a.isDone) - Number(b.isDone)
  );
  const sortedExpiredTodos = sortTodos(expiredTodos, expiredSort);
  const sortedUncompletedTodos = sortTodos(uncompletedTodos, uncompletedSort);
  const sortedCompletedTodos = sortTodos(completedTodos, completedSort);

  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value));
    setNewTodoName(e.target.value);
  };

  const updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value;
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const remove = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    const updatedTodayTodos = todayTodos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    setTodayTodos(updatedTodayTodos);
  };
  const updateIsDone = (id: string, value: boolean) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isDone: value };
      } else {
        return todo;
      }
    });
    setTodos(updatedTodos);
    const updatedTodayTodos = todayTodos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, isDone: value };
      }
      return todo;
    });
    setTodayTodos(updatedTodayTodos);
  };

  const addNewTodo = () => {
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }
    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setNewTodoName("");
    setNewTodoPriority(10);
    setNewTodoDeadline(null);
  };
  return (
    <div className="mx-4 mt-10 max-w-7xl md:mx-auto">
      <h1 className="mb-4 text-2xl font-bold">TodoApp</h1>
      {/* 今日やるタスクセクション */}
      <div className="mb-6 rounded-md border p-4">
        <div className="flex gap-x-96">
          <h2 className="text-lg font-bold">今日やるタスク</h2>
          <p>
            残り時間: {Math.floor(remainingTime / 3600)}時間{" "}
            {Math.floor((remainingTime % 3600) / 60)}分 {remainingTime % 60}秒
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <TodoList
            todos={sortedTodayTodos}
            updateIsDone={updateIsDone} // 完了処理
            remove={undefined} // 削除ボタンを表示しない
          />
        </div>
        <button
          onClick={openModal}
          className="mt-4 w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          タスクを追加
        </button>
      </div>

      {/* モーダルウィンドウ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-md bg-white p-6">
            <h3 className="text-lg font-bold">タスクを抽選</h3>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeUncompleted}
                  onChange={(e) => setIncludeUncompleted(e.target.checked)}
                />
                未完了から選ぶ
              </label>
              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeExpired}
                  onChange={(e) => setIncludeExpired(e.target.checked)}
                />
                期限切れから選ぶ
              </label>
              {(includeUncompleted ? uncompletedTodos.length : 0) +
                (includeExpired ? expiredTodos.length : 0) ===
                0 && (
                <h3 className="font-bold text-red-500">
                  登録されているタスクはありません。
                </h3>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="rounded-md bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                キャンセル
              </button>
              <button
                onClick={openVideoModal}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                抽選する
              </button>
            </div>
          </div>
        </div>
      )}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative size-full">
            {
              <div className="absolute left-64 top-4 flex size-2/3 items-center justify-center text-white">
                <div className="mx-4 mt-10 max-w-7xl md:mx-auto">
                  <TodoList todos={resulttodo} />
                </div>
              </div>
            }
            {/* モーダルを閉じるボタン */}
            <button
              onClick={closeVideoModal}
              className="absolute right-1 top-1 text-7xl text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* タスクリスト */}
        <div className="rounded-md border border-slate-500 p-4">
          <h2 className="font-bold">タスク</h2>

          {/* 期限切れ */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-red-500">期限切れ</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpiredSort("date")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  日付順
                </button>
                <button
                  onClick={() => setExpiredSort("priority")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  優先順
                </button>
              </div>
            </div>
            <TodoList
              todos={sortedExpiredTodos}
              updateIsDone={updateIsDone}
              remove={remove}
            />
          </div>

          {/* 未完了 */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">未完了</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUncompletedSort("date")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  日付順
                </button>
                <button
                  onClick={() => setUncompletedSort("priority")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  優先順
                </button>
              </div>
            </div>
            <TodoList
              todos={sortedUncompletedTodos}
              updateIsDone={updateIsDone}
              remove={remove}
            />
          </div>

          {/* 完了済み */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">完了済み</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompletedSort("date")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  日付順
                </button>
                <button
                  onClick={() => setCompletedSort("priority")}
                  className="my-4 w-16 rounded-md bg-blue-500 p-1 text-white hover:bg-blue-600"
                >
                  優先順
                </button>
              </div>
            </div>
            <TodoList
              todos={sortedCompletedTodos}
              updateIsDone={updateIsDone}
              remove={remove}
            />
          </div>
        </div>

        {/* 新しいタスクの追加フォーム */}
        <div className="size-96 flex-col rounded-md border p-4">
          <h2 className="text-lg font-bold">新しいタスクの追加</h2>
          <div className="grow space-y-3">
            {/* タスク名 */}
            <div>
              <label className="font-bold" htmlFor="newTodoName">
                名前
              </label>
              <input
                id="newTodoName"
                type="text"
                value={newTodoName}
                onChange={updateNewTodoName}
                className={twMerge(
                  "mt-1 w-full rounded-md border p-2",
                  newTodoNameError && "border-red-500 outline-red-500"
                )}
                placeholder="2文字以上 22文字以内で入力してください"
              />
              {newTodoNameError && (
                <p className="mt-2 text-sm text-red-500">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-2"
                  />
                  {newTodoNameError}
                </p>
              )}
            </div>

            {/* 締め切り */}
            <div>
              <label className="font-bold" htmlFor="newTodoDeadline">
                締め切り
              </label>
              <input
                id="newTodoDeadline"
                type="datetime-local"
                value={
                  newTodoDeadline
                    ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={updateDeadline}
                className="mt-1 w-full rounded-md border p-2"
              />
            </div>

            {/* 優先度 */}
            <div>
              <label className="font-bold" htmlFor="newTodoPriority">
                優先度: {newTodoPriority}
              </label>
              <input
                id="newTodoPriority"
                type="range"
                min={0}
                max={10}
                value={newTodoPriority}
                onChange={updateNewTodoPriority}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <button
            onClick={addNewTodo}
            className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
