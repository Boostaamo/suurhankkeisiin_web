// Hankkeen syke: pieni käyrä hankkeeseen kytkettyjen uutisten määrästä 12 kuukaudelta.
export default function Syke({ syke, leveys = 72, korkeus = 20 }: { syke: number[]; leveys?: number; korkeus?: number }) {
  const yht = syke.reduce((a, b) => a + b, 0);
  if (!yht) return null;
  const max = Math.max(...syke, 1);
  const p = syke.map((v, i) => [(i / (syke.length - 1)) * (leveys - 4) + 2, korkeus - 2 - (v / max) * (korkeus - 4)]);
  const viiva = p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const ala = `${viiva}L${p.at(-1)![0].toFixed(1)},${korkeus}L${p[0][0].toFixed(1)},${korkeus}Z`;
  return (
    <span className="syke" title={`${yht} uutista 12 kuukauden aikana`}>
      <svg width={leveys} height={korkeus} viewBox={`0 0 ${leveys} ${korkeus}`} aria-hidden="true">
        <path d={ala} className="syke-ala" />
        <path d={viiva} className="syke-viiva" />
        <circle cx={p.at(-1)![0]} cy={p.at(-1)![1]} r="2" className="syke-piste" />
      </svg>
      <span className="sr">{yht} uutista 12 kuukauden aikana</span>
    </span>
  );
}
