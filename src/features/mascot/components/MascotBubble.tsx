/** マスコットの吹き出し（CSSアニメーションで表示） */
export function MascotBubble({ text }: { text: string }) {
  return (
    <div className="relative rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm font-medium leading-relaxed">
      {text}
    </div>
  );
}
