'use strict';
// Halloween-Special: neue Fundsachen (30 Stück) für den Geisterwald
Object.assign(ITEMS, {
  hw_kuerbis: { n: 'Kürbis', d(c, f) {
    for (const [dx, rw] of [[-9, 11], [9, 11], [0, 13]]) { ell(c, dx, 3, rw, 15); fs(c, f('#f77f00'), 2.5); }
    rrPath(c, -3, -17, 6, 8, 2); fs(c, f('#6b4423'), 2); ell(c, 8, -14, 7, 3.5, -0.4); fs(c, f('#2b9348'), 2);
  } },
  hw_hexenhut: { n: 'Hexenhut', d(c, f) {
    ell(c, 0, 12, 22, 7); fs(c, f('#3c096c'), 2.5);
    polyPath(c, [[-13, 10], [13, 10], [6, -10], [12, -20], [0, -12]]); fs(c, f('#5a189a'), 2.5);
    rrPath(c, -13, 4, 26, 6, 2); fs(c, f('#80ed99'), 2); rrPath(c, -4, 3, 8, 8, 1); fs(c, f('#ffd60a'), 1.5);
  } },
  hw_besen: { n: 'Hexenbesen', d(c, f) {
    c.save(); c.rotate(-0.6); rrPath(c, -3, -24, 6, 32, 3); fs(c, f('#8d5a3b'), 2);
    polyPath(c, [[-5, 6], [5, 6], [12, 24], [-12, 24]]); fs(c, f('#e9c46a'), 2.5);
    for (const x of [-6, 0, 6]) line(c, x * 0.5, 9, x, 22, 1.5, f('#b08d3a'), false);
    rrPath(c, -6, 4, 12, 5, 2); fs(c, f('#c1121f'), 1.5); c.restore();
  } },
  hw_kerze: { n: 'Kerze', d(c, f) {
    rrPath(c, -8, -6, 16, 24, 3); fs(c, f('#fff3e0'), 2.5); ell(c, -3, -4, 3, 5); c.fillStyle = f('#ffe8cc'); c.fill();
    line(c, 0, -6, 0, -11, 2, OL, false); c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(7, -14, 0, -10); c.quadraticCurveTo(-7, -14, 0, -24); fs(c, f('#ffb703'), 1.5);
    ell(c, 0, 18, 14, 4); fs(c, f('#adb5bd'), 2);
  } },
  hw_lolli: { n: 'Lolli', d(c, f) {
    rrPath(c, -2, 2, 4, 22, 2); fs(c, f('#fff'), 1.5);
    ell(c, 0, -6, 15, 15); fs(c, f('#ff8fab'), 2.5);
    c.beginPath(); for (let a = 0; a < 9; a += 0.3) { const r = a * 1.6; c.lineTo(Math.cos(a) * r, -6 + Math.sin(a) * r); } c.lineWidth = 3; c.strokeStyle = f('#fff'); c.stroke();
  } },
  hw_bonbon: { n: 'Bonbon', d(c, f) {
    polyPath(c, [[-10, 0], [-22, -9], [-20, 9]]); fs(c, f('#ff9f1c'), 2); polyPath(c, [[10, 0], [22, -9], [20, 9]]); fs(c, f('#ff9f1c'), 2);
    ell(c, 0, 0, 12, 10); fs(c, f('#7b2cbf'), 2.5); line(c, -5, -6, 3, 8, 3, f('#c77dff'), false);
  } },
  hw_spinne: { n: 'Spinne', d(c, f) {
    line(c, 0, -24, 0, -10, 1.5, f('#adb5bd'), false);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(s * 6, -2 + k * 3); c.quadraticCurveTo(s * 16, -10 + k * 6, s * 19, 2 + k * 5); c.lineWidth = 2.5; c.strokeStyle = f('#2b2d42'); c.stroke(); }
    ell(c, 0, 2, 10, 11); fs(c, f('#2b2d42'), 2); ell(c, -4, -1, 3, 3.5); c.fillStyle = f('#fff'); c.fill(); ell(c, 4, -1, 3, 3.5); c.fill();
    ell(c, -4, 0, 1.4, 1.6); c.fillStyle = OL; c.fill(); ell(c, 4, 0, 1.4, 1.6); c.fill();
  } },
  hw_fledermaus: { n: 'Fledermaus', d(c, f) {
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -4); c.quadraticCurveTo(s * 16, -14, s * 24, -6); c.quadraticCurveTo(s * 20, -2, s * 21, 4); c.quadraticCurveTo(s * 15, 0, s * 13, 6); c.quadraticCurveTo(s * 9, 2, s * 6, 6); c.closePath(); fs(c, f('#3d2c5e'), 2); }
    ell(c, 0, 1, 8, 9); fs(c, f('#4a3a70'), 2); polyPath(c, [[-6, -6], [-4, -13], [-1, -7]]); fs(c, f('#4a3a70'), 1.5); polyPath(c, [[6, -6], [4, -13], [1, -7]]); fs(c, f('#4a3a70'), 1.5);
    ell(c, -3, 0, 2, 2); c.fillStyle = f('#ffd60a'); c.fill(); ell(c, 3, 0, 2, 2); c.fill();
  } },
  hw_zauberstab: { n: 'Zauberstab', d(c, f) {
    c.save(); c.rotate(0.6); rrPath(c, -2.5, -6, 5, 30, 2); fs(c, f('#3d2c1f'), 2); rrPath(c, -2.5, 16, 5, 8, 2); fs(c, f('#fff'), 1.5); c.restore();
    starPath(c, -8, -12, 11, 5); fs(c, f('#ffd60a'), 2.5);
  } },
  hw_kessel: { n: 'Hexenkessel', d(c, f) {
    ell(c, 0, 4, 19, 15); fs(c, f('#343a40'), 2.5); ell(c, 0, -8, 18, 5); fs(c, f('#70e000'), 2);
    for (const [x, r] of [[-6, 3], [4, 4], [10, 2.5]]) { ell(c, x, -14 - r, r, r); fs(c, f('#9ef01a'), 1.5); }
    rrPath(c, -12, 16, 5, 6, 2); fs(c, f('#343a40'), 2); rrPath(c, 7, 16, 5, 6, 2); fs(c, f('#343a40'), 2);
  } },
  hw_laterne: { n: 'Kürbis-Laterne', d(c, f) {
    c.beginPath(); c.arc(0, -12, 9, Math.PI, 0); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    for (const [dx, rw] of [[-7, 9], [7, 9], [0, 11]]) { ell(c, dx, 4, rw, 13); fs(c, f('#f77f00'), 2.2); }
    c.fillStyle = f('#ffd60a'); polyPath(c, [[-8, 0], [-3, 0], [-5.5, -5]]); c.fill(); polyPath(c, [[3, 0], [8, 0], [5.5, -5]]); c.fill();
    polyPath(c, [[-8, 7], [-4, 10], [0, 7], [4, 10], [8, 7], [5, 13], [-5, 13]]); c.fill();
  } },
  hw_maske: { n: 'Maske', d(c, f) {
    c.beginPath(); c.moveTo(-21, -6); c.quadraticCurveTo(0, -14, 21, -6); c.quadraticCurveTo(22, 10, 8, 10); c.quadraticCurveTo(0, 4, -8, 10); c.quadraticCurveTo(-22, 10, -21, -6); fs(c, f('#7b2cbf'), 2.5);
    ell(c, -9, 0, 5, 3.5); c.fillStyle = OL; c.fill(); ell(c, 9, 0, 5, 3.5); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 18, -8); c.quadraticCurveTo(s * 26, -22, s * 14, -24); c.lineWidth = 3; c.strokeStyle = f('#ffd60a'); c.stroke(); }
  } },
  hw_trank: { n: 'Zaubertrank', d(c, f) {
    rrPath(c, -4, -22, 8, 8, 2); fs(c, f('#8d5a3b'), 2);
    c.beginPath(); c.moveTo(-5, -14); c.lineTo(-5, -6); c.quadraticCurveTo(-18, 2, -14, 14); c.quadraticCurveTo(0, 24, 14, 14); c.quadraticCurveTo(18, 2, 5, -6); c.lineTo(5, -14); c.closePath(); fs(c, f('#e7f5ff'), 2.5);
    c.beginPath(); c.moveTo(-14, 6); c.quadraticCurveTo(0, 2, 14, 6); c.quadraticCurveTo(16, 20, 0, 20); c.quadraticCurveTo(-16, 20, -14, 6); c.fillStyle = f('#e0aaff'); c.fill();
    ell(c, -4, 11, 2.5, 2.5); c.fillStyle = f('#fff'); c.fill(); ell(c, 5, 14, 1.8, 1.8); c.fill();
  } },
  hw_gespenst: { n: 'Gespenst', d(c, f) {
    c.beginPath(); c.moveTo(-15, 18); c.quadraticCurveTo(-17, -20, 0, -21); c.quadraticCurveTo(17, -20, 15, 18);
    for (let k = 0; k < 4; k++) c.quadraticCurveTo(15 - k * 7.5 - 3.75, 23 - (k % 2) * 2, 15 - (k + 1) * 7.5, 18); fs(c, f('#f8f9fa'), 2.5);
    ell(c, -5, -6, 2.5, 3.5); c.fillStyle = OL; c.fill(); ell(c, 5, -6, 2.5, 3.5); c.fill(); ell(c, 0, 3, 3.5, 4.5); c.fill();
    ell(c, -10, 0, 3, 2); c.fillStyle = f('#ffc8dd'); c.fill(); ell(c, 10, 0, 3, 2); c.fill();
  } },
  hw_schoko: { n: 'Schokolade', d(c, f) {
    c.save(); c.rotate(-0.25); rrPath(c, -13, -18, 26, 36, 3); fs(c, f('#6f4e37'), 2.5);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { rrPath(c, -10 + i * 11, -15 + j * 11, 9, 9, 1.5); fs(c, f('#8b6247'), 1.2); }
    rrPath(c, -13, 2, 26, 16, 2); fs(c, f('#f77f00'), 2.5); if (!f.sil) txt(c, 'BUH', 0, 10, 8, '#fff', 'center', null); c.restore();
  } },
  hw_apfel: { n: 'Liebesapfel', d(c, f) {
    rrPath(c, -2, -26, 4, 16, 2); fs(c, f('#e9c46a'), 1.5);
    c.beginPath(); c.moveTo(0, -10); c.bezierCurveTo(18, -18, 22, 12, 0, 16); c.bezierCurveTo(-22, 12, -18, -18, 0, -10); fs(c, f('#d00000'), 2.5);
    ell(c, -7, -4, 3, 5, 0.4); c.fillStyle = f('rgba(255,255,255,.6)'); c.fill(); ell(c, 0, 16, 16, 4); fs(c, f('#9d0208'), 2);
  } },
  hw_muffin: { n: 'Kürbis-Muffin', d(c, f) {
    polyPath(c, [[-13, 0], [13, 0], [10, 18], [-10, 18]]); fs(c, f('#9b5de5'), 2.5); for (const x of [-6, 0, 6]) line(c, x, 2, x * 0.85, 16, 1.5, f('#7b2cbf'), false);
    c.beginPath(); c.moveTo(-15, 1); c.quadraticCurveTo(-16, -16, 0, -17); c.quadraticCurveTo(16, -16, 15, 1); c.closePath(); fs(c, f('#ffb703'), 2.5);
    for (const [x, y, col] of [[-6, -8, '#2b9348'], [5, -10, '#f8f9fa'], [0, -4, '#7b2cbf'], [8, -3, '#2b9348']]) { rrPath(c, x - 2, y - 1, 4, 2, 1); c.fillStyle = f(col); c.fill(); }
  } },
  hw_eimer: { n: 'Süßigkeiten-Eimer', d(c, f) {
    c.beginPath(); c.arc(0, -4, 16, Math.PI, 0); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
    ell(c, -6, -6, 5, 4); fs(c, f('#ff8fab'), 1.5); ell(c, 5, -7, 5, 4); fs(c, f('#70e000'), 1.5);
    polyPath(c, [[-15, -4], [15, -4], [12, 20], [-12, 20]]); fs(c, f('#f77f00'), 2.5);
    c.fillStyle = OL; polyPath(c, [[-8, 2], [-3, 2], [-5.5, -2]]); c.fill(); polyPath(c, [[3, 2], [8, 2], [5.5, -2]]); c.fill();
    polyPath(c, [[-7, 9], [-3, 12], [0, 9], [3, 12], [7, 9], [4, 15], [-4, 15]]); c.fill();
  } },
  hw_buch: { n: 'Zauberbuch', d(c, f) {
    rrPath(c, -15, -18, 30, 36, 3); fs(c, f('#2d6a4f'), 2.5); rrPath(c, 11, -16, 4, 32, 1); fs(c, f('#fff3e0'), 1.5);
    starPath(c, -2, -2, 9, 4); fs(c, f('#ffd60a'), 2); ell(c, -2, 12, 6, 2); c.fillStyle = f('#95d5b2'); c.fill();
  } },
  hw_katze: { n: 'Schwarze Katze', d(c, f) {
    c.beginPath(); c.moveTo(10, 14); c.quadraticCurveTo(26, 10, 18, -8); c.lineWidth = 5; c.strokeStyle = f('#22223b'); c.stroke();
    ell(c, 0, 8, 12, 11); fs(c, f('#22223b'), 2); ell(c, 0, -8, 11, 10); fs(c, f('#22223b'), 2);
    polyPath(c, [[-10, -12], [-9, -22], [-3, -16]]); fs(c, f('#22223b'), 1.5); polyPath(c, [[10, -12], [9, -22], [3, -16]]); fs(c, f('#22223b'), 1.5);
    ell(c, -4, -8, 2.5, 3); c.fillStyle = f('#b5e48c'); c.fill(); ell(c, 4, -8, 2.5, 3); c.fill();
  } },
  hw_mond: { n: 'Mond-Amulett', d(c, f) {
    c.beginPath(); c.moveTo(-14, -22); c.quadraticCurveTo(0, -4, 14, -22); c.lineWidth = 2; c.strokeStyle = f('#c9a227'); c.stroke();
    ell(c, 0, 4, 15, 15); fs(c, f('#ffd60a'), 2.5); ell(c, 6, 0, 12, 12); c.fillStyle = f('#3c096c'); c.fill();
    starPath(c, 8, 8, 4, 1.8); c.fillStyle = f('#fff'); c.fill();
  } },
  hw_kastanie: { n: 'Kastanie', d(c, f) {
    c.beginPath(); c.moveTo(0, -16); c.bezierCurveTo(20, -14, 20, 16, 0, 16); c.bezierCurveTo(-20, 16, -20, -14, 0, -16); fs(c, f('#7f4f24'), 2.5);
    c.beginPath(); c.moveTo(-14, 6); c.quadraticCurveTo(0, 12, 14, 6); c.quadraticCurveTo(12, 16, 0, 16); c.quadraticCurveTo(-12, 16, -14, 6); c.fillStyle = f('#d4a373'); c.fill();
    ell(c, -6, -6, 3, 5, 0.5); c.fillStyle = f('rgba(255,255,255,.4)'); c.fill();
  } },
  hw_eule: { n: 'Eule', d(c, f) {
    ell(c, 0, 4, 15, 17); fs(c, f('#9c6644'), 2.5); ell(c, 0, 9, 9, 10); c.fillStyle = f('#e6ccb2'); c.fill();
    polyPath(c, [[-13, -8], [-11, -20], [-4, -12]]); fs(c, f('#9c6644'), 2); polyPath(c, [[13, -8], [11, -20], [4, -12]]); fs(c, f('#9c6644'), 2);
    ell(c, -6, -4, 6, 6); fs(c, f('#fff'), 2); ell(c, 6, -4, 6, 6); fs(c, f('#fff'), 2); ell(c, -6, -4, 2.5, 2.5); c.fillStyle = OL; c.fill(); ell(c, 6, -4, 2.5, 2.5); c.fill();
    polyPath(c, [[-3, 2], [3, 2], [0, 7]]); fs(c, f('#ffb703'), 1.5);
  } },
  hw_umhang: { n: 'Umhang', d(c, f) {
    c.beginPath(); c.moveTo(-8, -18); c.quadraticCurveTo(-24, 6, -20, 20); c.quadraticCurveTo(0, 14, 20, 20); c.quadraticCurveTo(24, 6, 8, -18); c.closePath(); fs(c, f('#212529'), 2.5);
    c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(-16, 6, -12, 16); c.quadraticCurveTo(0, 12, 12, 16); c.quadraticCurveTo(16, 6, 6, -16); c.closePath(); c.fillStyle = f('#c1121f'); c.fill();
    rrPath(c, -10, -21, 20, 6, 3); fs(c, f('#212529'), 2); ell(c, 0, -18, 3, 3); fs(c, f('#ffd60a'), 1.5);
  } },
  hw_blatt: { n: 'Herbstblatt', d(c, f) {
    c.beginPath(); c.moveTo(0, 18); for (let k = 0; k <= 10; k++) { const a = Math.PI + k * Math.PI / 10, r = k % 2 ? 11 : 20; c.lineTo(Math.cos(a) * r, -2 + Math.sin(a) * r); } c.closePath(); fs(c, f('#e85d04'), 2.5);
    line(c, 0, 18, 0, -18, 2, f('#9d0208'), false); line(c, 0, 0, -10, -10, 1.5, f('#9d0208'), false); line(c, 0, 0, 10, -10, 1.5, f('#9d0208'), false);
  } },
  hw_eichel: { n: 'Eichel', d(c, f) {
    c.beginPath(); c.moveTo(-11, -2); c.quadraticCurveTo(-12, 18, 0, 20); c.quadraticCurveTo(12, 18, 11, -2); c.closePath(); fs(c, f('#bc6c25'), 2.5);
    c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, -20, 14, 0); c.closePath(); fs(c, f('#7f5539'), 2.5); rrPath(c, -2, -16, 4, 7, 2); fs(c, f('#7f5539'), 1.5);
  } },
  hw_gummibaer: { n: 'Gummibärchen', d(c, f) {
    ell(c, 0, 6, 11, 13); fs(c, f('#70e000'), 2.5); ell(c, 0, -10, 9, 8); fs(c, f('#70e000'), 2.5);
    ell(c, -7, -16, 3.5, 3.5); fs(c, f('#70e000'), 2); ell(c, 7, -16, 3.5, 3.5); fs(c, f('#70e000'), 2);
    ell(c, -3, -11, 1.5, 1.5); c.fillStyle = OL; c.fill(); ell(c, 3, -11, 1.5, 1.5); c.fill(); ell(c, -4, 2, 3, 5, 0.3); c.fillStyle = f('rgba(255,255,255,.45)'); c.fill();
  } },
  hw_popcorn: { n: 'Popcorn', d(c, f) {
    for (const [x, y] of [[-9, -10], [0, -14], [9, -10], [-5, -16], [5, -18]]) { ell(c, x, y, 7, 6); fs(c, f('#fff3bf'), 2); }
    polyPath(c, [[-14, -8], [14, -8], [10, 20], [-10, 20]]); fs(c, f('#fff'), 2.5);
    for (const x of [-8, 0, 8]) { polyPath(c, [[x - 2.5, -8], [x + 2.5, -8], [x * 0.75 + 2, 20], [x * 0.75 - 2, 20]]); c.fillStyle = f('#f77f00'); c.fill(); }
  } },
  hw_kristall: { n: 'Kristallkugel', d(c, f) {
    polyPath(c, [[-12, 14], [12, 14], [8, 22], [-8, 22]]); fs(c, f('#7f5539'), 2);
    ell(c, 0, -2, 16, 16); fs(c, f('#c8b6ff'), 2.5); ell(c, 2, 0, 9, 7); c.fillStyle = f('rgba(255,255,255,.35)'); c.fill();
    ell(c, -6, -8, 4, 6, 0.5); c.fillStyle = f('rgba(255,255,255,.75)'); c.fill(); starPath(c, 5, 2, 4, 1.8); c.fillStyle = f('#fff'); c.fill();
  } },
  hw_wurm: { n: 'Gummiwurm', d(c, f) {
    c.beginPath(); c.moveTo(-18, 10); c.bezierCurveTo(-10, -18, 4, 22, 18, -10); c.lineWidth = 11; c.strokeStyle = OL; c.stroke(); c.lineWidth = 7.5;
    const g = c.createLinearGradient(-18, 0, 18, 0); g.addColorStop(0, f('#ff006e')); g.addColorStop(0.5, f('#ffbe0b')); g.addColorStop(1, f('#3a86ff')); c.strokeStyle = f.sil ? f('#000') : g; c.stroke();
    ell(c, 16, -9, 1.5, 1.5); c.fillStyle = OL; c.fill();
  } },
});
const HW_ITEM_IDS = Object.keys(ITEMS).filter(k => /^hw_/.test(k));
// alle 30 Sachen gibt es im Geisterwald zu finden
