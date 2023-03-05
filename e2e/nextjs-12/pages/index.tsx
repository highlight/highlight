import type { NextPage } from 'next';

const consoleMethods = ['log', 'info', 'warn', 'error'] as (keyof Pick<
  Console,
  'log' | 'info' | 'warn' | 'error'
>)[];

function ConsoleButtons() {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {consoleMethods.map((m) => (
        <button
          key={m}
          onClick={() => console[m](`${m} message: ${Math.random()}`)}
        >
          console.{m}()
        </button>
      ))}
    </div>
  );
}

const HomePage: NextPage = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6">
      <p className="text-slate-600">
        <ConsoleButtons />
      </p>
    </div>
  );
};

export default HomePage;
