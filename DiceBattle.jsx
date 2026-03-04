import { useState } from "react";

const DICE_FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];

const WEAPONS = [
  { id: 0, name: "Espada de Ferro", icon: "⚔️", cost: 0, bonus: "" },
  { id: 1, name: "Machado de Fogo", icon: "🪓", cost: 5, bonus: "+5 moedas/vitória" },
  { id: 2, name: "Lança Relâmpago", icon: "⚡", cost: 10, bonus: "+10 moedas/vitória" },
  { id: 3, name: "Katana Sombria", icon: "🗡️", cost: 15, bonus: "+2 diamantes/vitória" },
  { id: 4, name: "Martelo Divino", icon: "🔨", cost: 25, bonus: "2x tudo" },
];

const DICE_SKINS = [
  { id: 0, name: "Dado Padrão", color: "from-gray-600 to-gray-800", cost: 0 },
  { id: 1, name: "Dado de Fogo", color: "from-orange-500 to-red-700", cost: 5 },
  { id: 2, name: "Dado Glacial", color: "from-blue-400 to-cyan-700", cost: 10 },
  { id: 3, name: "Dado Dourado", color: "from-yellow-400 to-yellow-600", cost: 20 },
  { id: 4, name: "Dado Divino", color: "from-purple-500 to-pink-600", cost: 30 },
];

const TITLES = [
  { id: 0, name: "Novato", cost: 0, color: "text-gray-300" },
  { id: 1, name: "Guerreiro", cost: 5, color: "text-green-400" },
  { id: 2, name: "Campeão", cost: 10, color: "text-blue-400" },
  { id: 3, name: "Lendário", cost: 20, color: "text-yellow-400" },
  { id: 4, name: "Divino", cost: 35, color: "text-purple-400" },
];

const initPlayer = (name, isAdmin = false) => ({
  name,
  coins: isAdmin ? 500 : 100,
  diamonds: isAdmin ? 50 : 0,
  luck: isAdmin ? 100 : 0,
  hp: 100,
  weapon: 0,
  diceSkin: 0,
  title: 0,
  goldenDice: false,
  isAdmin,
  eliminated: false,
});

export default function DiceGame() {
  const [players, setPlayers] = useState([
    initPlayer("👑 Admin", true),
    initPlayer("⚔️ Inimigo"),
  ]);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState([]);
  const [activeTab, setActiveTab] = useState("game");
  const [shopTab, setShopTab] = useState("weapon");
  const [adminTarget, setAdminTarget] = useState(0);
  const [adminAmount, setAdminAmount] = useState(10);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [animDice, setAnimDice] = useState("⚄");
  const [showResult, setShowResult] = useState(null);

  const addLog = (msg, type = "info") => {
    setLog(prev => [{ msg, type, id: Date.now() + Math.random() }, ...prev.slice(0, 29)]);
  };

  const updatePlayer = (index, updates) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const rollDice = () => {
    if (rolling) return;
    const attacker = players[currentTurn];
    const defenderIdx = currentTurn === 0 ? 1 : 0;
    const defender = players[defenderIdx];
    if (attacker.eliminated || defender.eliminated) return;

    setRolling(true);
    setShowResult(null);

    let count = 0;
    const interval = setInterval(() => {
      setAnimDice(DICE_FACES[Math.floor(Math.random() * 6)]);
      count++;
      if (count >= 14) {
        clearInterval(interval);

        const luckBonus = attacker.luck;
        const rand = Math.random() * 100;
        const goldenChance = 5 + luckBonus * 0.1;
        const winChance = 40 + luckBonus * 0.3;

        let resultType = "lose";
        if (rand < goldenChance) resultType = "golden";
        else if (rand < winChance) resultType = "win";

        const face = resultType === "golden" ? "⚅" : resultType === "win" ? DICE_FACES[Math.floor(Math.random()*3)+3] : DICE_FACES[Math.floor(Math.random()*3)];
        setAnimDice(face);

        const weaponBonus = WEAPONS[attacker.weapon];
        let coinsGain = 0, diamondsGain = 0;

        if (resultType === "golden") {
          coinsGain = attacker.goldenDice ? 80 : 40;
          diamondsGain = attacker.goldenDice ? 4 : 2;
          if (weaponBonus.id === 4) { coinsGain *= 2; diamondsGain *= 2; }
          if (weaponBonus.id === 1) coinsGain += 5;
          if (weaponBonus.id === 2) coinsGain += 10;
          if (weaponBonus.id === 3) diamondsGain += 2;

          const newHp = Math.max(0, defender.hp - 30);
          setPlayers(prev => prev.map((p, i) => {
            if (i === currentTurn) return { ...p, coins: p.coins + coinsGain, diamonds: p.diamonds + diamondsGain, luck: Math.max(0, p.luck - 5) };
            if (i === defenderIdx) return { ...p, hp: newHp, eliminated: newHp <= 0 };
            return p;
          }));
          setShowResult({ type: "golden", msg: `🌟 DADO DOURADO! +${coinsGain}🪙 +${diamondsGain}💎 -30 HP inimigo!` });
          addLog(`🌟 ${attacker.name} rolou DADO DOURADO! +${coinsGain}🪙 +${diamondsGain}💎`, "golden");
          if (newHp <= 0) addLog(`💀 ${defender.name} foi eliminado!`, "death");

        } else if (resultType === "win") {
          coinsGain = attacker.goldenDice ? 40 : 20;
          diamondsGain = attacker.goldenDice ? 2 : 1;
          if (weaponBonus.id === 4) { coinsGain *= 2; diamondsGain *= 2; }
          if (weaponBonus.id === 1) coinsGain += 5;
          if (weaponBonus.id === 2) coinsGain += 10;
          if (weaponBonus.id === 3) diamondsGain += 2;

          const newHp = Math.max(0, defender.hp - 15);
          setPlayers(prev => prev.map((p, i) => {
            if (i === currentTurn) return { ...p, coins: p.coins + coinsGain, diamonds: p.diamonds + diamondsGain, luck: Math.max(0, p.luck - 3) };
            if (i === defenderIdx) return { ...p, hp: newHp, eliminated: newHp <= 0 };
            return p;
          }));
          setShowResult({ type: "win", msg: `⚔️ VITÓRIA! +${coinsGain}🪙 +${diamondsGain}💎 -15 HP inimigo!` });
          addLog(`⚔️ ${attacker.name} atacou! +${coinsGain}🪙 +${diamondsGain}💎`, "win");
          if (newHp <= 0) addLog(`💀 ${defender.name} foi eliminado!`, "death");

        } else {
          setPlayers(prev => prev.map((p, i) => {
            if (i === currentTurn) return { ...p, coins: Math.max(0, p.coins - 10), luck: Math.min(100, p.luck + 5) };
            return p;
          }));
          setShowResult({ type: "lose", msg: `😔 DERROTA! -10🪙 Sorte acumulada!` });
          addLog(`😔 ${attacker.name} perdeu! -10🪙 +sorte`, "lose");
        }

        setCurrentTurn(t => t === 0 ? 1 : 0);
        setRolling(false);
      }
    }, 80);
  };

  const adminAction = (action) => {
    const t = adminTarget;
    const amt = parseInt(adminAmount) || 10;
    setPlayers(prev => prev.map((p, i) => {
      if (i !== t) return p;
      switch (action) {
        case "addCoins": addLog(`👑 Admin deu ${amt}🪙 para ${p.name}`, "admin"); return { ...p, coins: p.coins + amt };
        case "removeCoins": addLog(`👑 Admin removeu ${amt}🪙 de ${p.name}`, "admin"); return { ...p, coins: Math.max(0, p.coins - amt) };
        case "addDiamonds": addLog(`👑 Admin deu ${amt}💎 para ${p.name}`, "admin"); return { ...p, diamonds: p.diamonds + amt };
        case "removeDiamonds": addLog(`👑 Admin removeu ${amt}💎 de ${p.name}`, "admin"); return { ...p, diamonds: Math.max(0, p.diamonds - amt) };
        case "addLuck": addLog(`👑 Admin deu sorte para ${p.name}`, "admin"); return { ...p, luck: Math.min(100, p.luck + amt) };
        case "resetLuck": addLog(`👑 Admin zerou sorte de ${p.name}`, "admin"); return { ...p, luck: 0 };
        case "eliminate": addLog(`💀 Admin eliminou ${p.name}!`, "death"); return { ...p, hp: 0, eliminated: true };
        case "revive": addLog(`✨ Admin reviveu ${p.name}!`, "admin"); return { ...p, hp: 100, eliminated: false };
        case "goldenDice": addLog(`🌟 Admin ${p.goldenDice?"removeu":"deu"} Dado Dourado para ${p.name}`, "admin"); return { ...p, goldenDice: !p.goldenDice };
        case "fullHeal": addLog(`💚 Admin curou ${p.name}!`, "admin"); return { ...p, hp: 100 };
        case "maxCoins": addLog(`💰 Admin deu max moedas para ${p.name}`, "admin"); return { ...p, coins: 9999 };
        case "maxDiamonds": addLog(`💎 Admin deu max diamantes para ${p.name}`, "admin"); return { ...p, diamonds: 999 };
        case "maxLuck": addLog(`🍀 Admin deu sorte máxima para ${p.name}`, "admin"); return { ...p, luck: 100 };
        default: return p;
      }
    }));
  };

  const buyItem = (type, item) => {
    const p = players[0];
    if (item.cost > 0 && p.diamonds < item.cost) return;
    setPlayers(prev => prev.map((pl, i) => {
      if (i !== 0) return pl;
      if (type === "weapon") return { ...pl, weapon: item.id, diamonds: pl.diamonds - item.cost };
      if (type === "dice") return { ...pl, diceSkin: item.id, diamonds: pl.diamonds - item.cost };
      if (type === "title") return { ...pl, title: item.id, diamonds: pl.diamonds - item.cost };
      return pl;
    }));
    addLog(`🛒 ${p.name} comprou ${item.name}!`, "shop");
  };

  const getLogColor = (type) => ({
    golden: "text-yellow-300", win: "text-green-300", lose: "text-red-300",
    admin: "text-purple-300", death: "text-red-500", shop: "text-blue-300"
  }[type] || "text-gray-300");

  const currentPlayer = players[currentTurn];
  const diceSkin = DICE_SKINS[currentPlayer.diceSkin];
  const gameOver = players.some(p => p.eliminated);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)", color: "white", fontFamily: "monospace", padding: "12px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(90deg, #facc15, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
            🎲 DICE BATTLE ⚔️
          </h1>
        </div>

        {/* Players */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {players.map((p, i) => (
            <div key={i} style={{ borderRadius: 16, padding: 14, border: `2px solid ${i === currentTurn ? "#facc15" : "#374151"}`, background: i === currentTurn ? "#1f2937" : "#111827", opacity: p.eliminated ? 0.5 : 1, position: "relative" }}>
              {i === currentTurn && !p.eliminated && (
                <div style={{ position: "absolute", top: 8, right: 8, color: "#facc15", fontSize: 11, fontWeight: "bold" }}>▶ Sua vez!</div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ color: TITLES[p.title].color.replace("text-",""), fontSize: 11 }}>[{TITLES[p.title].name}]</div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{p.name}</div>
                </div>
                <div style={{ fontSize: 28 }}>{WEAPONS[p.weapon].icon}</div>
              </div>
              {/* HP Bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><span>❤️ HP</span><span>{p.hp}/100</span></div>
                <div style={{ background: "#374151", borderRadius: 9999, height: 10 }}>
                  <div style={{ height: 10, borderRadius: 9999, width: `${p.hp}%`, background: p.hp > 50 ? "#22c55e" : p.hp > 25 ? "#eab308" : "#ef4444", transition: "width 0.4s" }}></div>
                </div>
              </div>
              {/* Luck Bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}><span>🍀 Sorte</span><span>{p.luck}%</span></div>
                <div style={{ background: "#374151", borderRadius: 9999, height: 7 }}>
                  <div style={{ height: 7, borderRadius: 9999, width: `${p.luck}%`, background: "#60a5fa", transition: "width 0.4s" }}></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span>🪙 {p.coins}</span>
                <span>💎 {p.diamonds}</span>
                {p.goldenDice && <span style={{ color: "#facc15" }}>🌟 Dado Dourado</span>}
              </div>
              {p.eliminated && <div style={{ color: "#ef4444", fontWeight: "bold", textAlign: "center", marginTop: 6 }}>💀 ELIMINADO</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[["game","🎲 Jogo"],["shop","🛒 Loja"],["admin","👑 Admin"],["log","📜 Log"]].map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "7px 14px", borderRadius: 10, fontWeight: "bold", fontSize: 13, border: "none", cursor: "pointer", background: activeTab === t ? "#eab308" : "#1f2937", color: activeTab === t ? "#000" : "#d1d5db", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* GAME TAB */}
        {activeTab === "game" && (
          <div style={{ background: "#111827", borderRadius: 16, padding: 20, border: "1px solid #374151", textAlign: "center" }}>
            {/* Dice */}
            <div style={{ display: "inline-block", fontSize: 90, marginBottom: 12, padding: 16, borderRadius: 20, background: `linear-gradient(135deg, var(--d1), var(--d2))`, animation: rolling ? "spin 0.3s linear infinite" : "none" }}
              className={`bg-gradient-to-br ${diceSkin.color}`}>
              {animDice}
            </div>

            {/* Result Banner */}
            {showResult && (
              <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, fontWeight: "bold", fontSize: 16,
                background: showResult.type === "golden" ? "#422006" : showResult.type === "win" ? "#052e16" : "#450a0a",
                border: `1px solid ${showResult.type === "golden" ? "#ca8a04" : showResult.type === "win" ? "#16a34a" : "#b91c1c"}`,
                color: showResult.type === "golden" ? "#fde68a" : showResult.type === "win" ? "#86efac" : "#fca5a5" }}>
                {showResult.msg}
              </div>
            )}

            <div style={{ marginBottom: 14, color: "#d1d5db" }}>
              Vez de: <span style={{ color: "#facc15", fontWeight: "bold" }}>{currentPlayer.name}</span>
              {currentPlayer.goldenDice && <span style={{ marginLeft: 8, color: "#fde68a" }}>🌟 Dado Dourado ativo!</span>}
            </div>

            {gameOver && (
              <div style={{ marginBottom: 12, padding: 12, background: "#450a0a", borderRadius: 12, color: "#fca5a5", fontWeight: "bold", fontSize: 18 }}>
                🏆 {players.find(p => !p.eliminated)?.name} VENCEU!
                <button onClick={() => { setPlayers([initPlayer("👑 Admin",true), initPlayer("⚔️ Inimigo")]); setLog([]); setCurrentTurn(0); setShowResult(null); }}
                  style={{ display: "block", margin: "10px auto 0", padding: "8px 20px", background: "#16a34a", border: "none", borderRadius: 8, color: "white", fontWeight: "bold", cursor: "pointer" }}>
                  🔄 Reiniciar
                </button>
              </div>
            )}

            <button onClick={rollDice} disabled={rolling || gameOver || currentPlayer.eliminated}
              style={{ padding: "16px 48px", borderRadius: 20, fontWeight: 900, fontSize: 20, border: "none", cursor: rolling || gameOver || currentPlayer.eliminated ? "not-allowed" : "pointer",
                background: rolling || gameOver ? "#374151" : "linear-gradient(135deg, #facc15, #f97316)", color: rolling || gameOver ? "#6b7280" : "#000", transition: "all 0.2s", transform: "scale(1)" }}>
              {rolling ? "Rolando... 🎲" : "🎲 ROLAR DADO"}
            </button>

            {/* Legend */}
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { color: "#fde68a", icon: "🌟", title: "Dado Dourado", sub: "5~15% chance", reward: "+40🪙 +2💎 x2" },
                { color: "#86efac", icon: "⚔️", title: "Vitória", sub: "Depende da sorte", reward: "+20🪙 +1💎" },
                { color: "#fca5a5", icon: "😔", title: "Derrota", sub: "Acumula sorte", reward: "-10🪙 +sorte" },
              ].map(item => (
                <div key={item.title} style={{ background: "#1f2937", borderRadius: 10, padding: 10, fontSize: 12 }}>
                  <div style={{ color: item.color, fontWeight: "bold" }}>{item.icon} {item.title}</div>
                  <div style={{ color: "#9ca3af" }}>{item.sub}</div>
                  <div style={{ color: item.color }}>{item.reward}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHOP TAB */}
        {activeTab === "shop" && (
          <div style={{ background: "#111827", borderRadius: 16, padding: 16, border: "1px solid #374151" }}>
            <div style={{ textAlign: "center", marginBottom: 12, color: "#60a5fa", fontWeight: "bold", fontSize: 16 }}>💎 Loja — Admin tem {players[0].diamonds} 💎</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["weapon","⚔️ Armas"],["dice","🎲 Dados"],["title","🏆 Títulos"]].map(([t, label]) => (
                <button key={t} onClick={() => setShopTab(t)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: "bold", border: "none", cursor: "pointer", background: shopTab === t ? "#2563eb" : "#1f2937", color: "white" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(shopTab === "weapon" ? WEAPONS : shopTab === "dice" ? DICE_SKINS : TITLES).map(item => {
                const owned = shopTab === "weapon" ? players[0].weapon === item.id : shopTab === "dice" ? players[0].diceSkin === item.id : players[0].title === item.id;
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, border: `1px solid ${owned ? "#ca8a04" : "#374151"}`, background: owned ? "#1c1005" : "#1f2937" }}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>{item.icon || "🏷️"} {item.name}</span>
                      {item.bonus && <div style={{ fontSize: 11, color: "#86efac" }}>{item.bonus}</div>}
                      {owned && <div style={{ fontSize: 11, color: "#fde68a" }}>✓ Equipado</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#93c5fd", fontSize: 13 }}>💎 {item.cost}</span>
                      <button onClick={() => buyItem(shopTab, item)}
                        disabled={item.cost === 0 || players[0].diamonds < item.cost || owned}
                        style={{ padding: "6px 14px", borderRadius: 8, fontWeight: "bold", fontSize: 12, border: "none", cursor: item.cost === 0 || owned ? "default" : "pointer",
                          background: owned ? "#374151" : players[0].diamonds >= item.cost && item.cost > 0 ? "#2563eb" : "#374151", color: "white" }}>
                        {item.cost === 0 ? "Padrão" : owned ? "Equipado" : "Comprar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === "admin" && (
          <div style={{ background: "#0f0a1e", borderRadius: 16, padding: 16, border: "2px solid #7c3aed" }}>
            <div style={{ textAlign: "center", marginBottom: 14, color: "#c084fc", fontWeight: 900, fontSize: 18 }}>👑 PAINEL ADMIN</div>
            
            {/* Target */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>🎯 Alvo:</div>
              <div style={{ display: "flex", gap: 8 }}>
                {players.map((p, i) => (
                  <button key={i} onClick={() => setAdminTarget(i)}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", background: adminTarget === i ? "#7c3aed" : "#1f2937", color: "white" }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>🔢 Quantidade:</div>
              <input type="number" value={adminAmount} onChange={e => setAdminAmount(e.target.value)}
                style={{ width: "100%", background: "#1f2937", border: "1px solid #4b5563", borderRadius: 8, padding: "8px 12px", color: "white", fontSize: 14, boxSizing: "border-box" }} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["addCoins","🪙+ Dar Moedas","#15803d"],
                ["removeCoins","🪙- Tirar Moedas","#b91c1c"],
                ["addDiamonds","💎+ Dar Diamantes","#1d4ed8"],
                ["removeDiamonds","💎- Tirar Diamantes","#991b1b"],
                ["addLuck","🍀+ Dar Sorte","#0f766e"],
                ["resetLuck","🍀✕ Zerar Sorte","#374151"],
                ["maxCoins","💰 Max Moedas","#b45309"],
                ["maxDiamonds","💎 Max Diamantes","#1e40af"],
                ["maxLuck","🍀 Sorte Máxima","#065f46"],
                ["goldenDice","🌟 Toggle Dado Dourado","#92400e"],
                ["fullHeal","💚 Curar Totalmente","#166534"],
                ["revive","✨ Reviver","#3730a3"],
                ["eliminate","💀 Eliminar","#7f1d1d"],
              ].map(([action, label, bg]) => (
                <button key={action} onClick={() => adminAction(action)}
                  style={{ background: bg, border: "none", borderRadius: 8, padding: "10px 8px", color: "white", fontWeight: "bold", fontSize: 12, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === "log" && (
          <div style={{ background: "#111827", borderRadius: 16, padding: 14, border: "1px solid #374151", maxHeight: 320, overflowY: "auto" }}>
            <div style={{ color: "#9ca3af", fontWeight: "bold", marginBottom: 8 }}>📜 Histórico de Eventos</div>
            {log.length === 0 && <div style={{ color: "#4b5563", textAlign: "center" }}>Nenhum evento ainda...</div>}
            {log.map(entry => (
              <div key={entry.id} style={{ fontSize: 13, padding: "5px 0", borderBottom: "1px solid #1f2937", color: getLogColor(entry.type) }}>
                {entry.msg}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
