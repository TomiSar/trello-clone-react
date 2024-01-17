import { create } from 'zustand';
import { getTodosGroupedByColumns } from '@/lib/getTodosGroupedByColumns';
import { databases, ID, storage } from '@/appwrite';
import uploadImage from '@/lib/uploadImage';

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateToDoInDB: (todo: ToDo, columnId: TypedColumn) => void;
  searchString: string;
  newTaskInput: string;
  newTaskType: TypedColumn;
  image: File | null;

  setSearchString: (searchString: string) => void;
  setNewTaskInput: (input: string) => void;
  setNewTaskType: (task: TypedColumn) => void;
  setImage: (image: File | null) => void;
  deleteTask: (taskIndex: number, todoId: ToDo, id: TypedColumn) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumns();
    set({ board });
  },
  setBoardState: (board) => set({ board }),

  updateToDoInDB: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },

  searchString: '',
  newTaskInput: '',
  newTaskType: 'todo',
  image: null,
  setSearchString: (searchString) => set({ searchString }),
  setNewTaskInput: (input: string) => set({ newTaskInput: input }),
  setNewTaskType: (task) => set({ newTaskType: task }),
  setImage: (image: File | null) => set({ image }),

  deleteTask: async (taskIndex: number, todo: ToDo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    // delete todoId from newColums
    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      // console.log('Uploaded image', fileUploaded);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        // include image if it exists
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: '' });
    set((state) => {
      const newColumns = new Map(state.board.columns);

      const newTodo: ToDo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        // include image if it exists
        ...(file && { image: file }),
      };

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColumns,
        },
      };
    });
  },
}));
