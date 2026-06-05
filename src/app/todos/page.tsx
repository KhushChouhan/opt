import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface Todo {
  id: string | number;
  name: string;
}

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="max-w-md mx-auto my-16 p-6 glass-panel rounded-lg border border-[#d4af37]/20 text-white">
      <h1 className="font-luxury text-xl font-bold mb-4 text-[#d4af37] border-b border-[#d4af37]/10 pb-2">
        Supabase Todos List
      </h1>
      {todos && todos.length > 0 ? (
        <ul className="space-y-2 text-sm text-gray-300">
          {todos.map((todo: Todo) => (
            <li key={todo.id} className="flex items-center space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              <span>{todo.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 italic">No tasks found in the &quot;todos&quot; database table.</p>
      )}
    </div>
  )
}
