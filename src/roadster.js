// A tiny faceted model keeps the nose-to-tail axis fixed while the body rolls.
// Model coordinates: X points toward the nose, Y points up, Z points toward us.
export function projectRoadsterPoint([x, y, z], roll = 0) {
  const cos = Math.cos(roll), sin = Math.sin(roll);
  const up = y * cos - z * sin;
  const near = y * sin + z * cos;
  return { x: x + near * .16, y: -up + near * .24, depth: near + up * .24 };
}

const rear = -25, nose = 26;
const mesh = [];
function face(color, points) { mesh.push({ color, points }); }
// Silver wedge: tall, squared tail; a long hood that tapers down to a sharp nose.
face('#59666a', [[rear,-3,-8],[nose,-3,-6],[nose,-3,6],[rear,-3,8]]);
face('#bdc7c8', [[rear,-3,8],[nose,-3,6],[nose,1,6],[12,4,8],[rear,5,8]]);
face('#8b989d', [[nose,-3,-6],[rear,-3,-8],[rear,5,-8],[12,4,-8],[nose,1,-6]]);
face('#e4e9e6', [[rear,5,-8],[rear,5,8],[12,4,8],[nose,1,6],[nose,1,-6],[12,4,-8]]);
face('#dae1de', [[nose,-3,6],[nose,-3,-6],[nose,1,-6],[nose,1,6]]);
face('#354044', [[rear,-3,-8],[rear,-3,8],[rear,5,8],[rear,5,-8]]);
// Long, low canopy and swept glass, rather than the previous upright cabin.
face('#c4d0d0', [[-20,5,8],[-11,10,5],[1,10,5],[13,4,8]]);
face('#a1aeb1', [[13,4,-8],[1,10,-5],[-11,10,-5],[-20,5,-8]]);
face('#eaf0eb', [[-11,10,-5],[-11,10,5],[1,10,5],[1,10,-5]]);
face('#263d41', [[1,10,-5],[1,10,5],[13,4,8],[13,4,-8]]);
face('#34474a', [[-20,5,-8],[-20,5,8],[-11,10,5],[-11,10,-5]]);
face('#263c40', [[-18,5.5,8.15],[-10,9,5.8],[-1,9,5.8],[9,5,8.15]]);
face('#1e3035', [[9,5,-8.15],[-1,9,-5.8],[-10,9,-5.8],[-18,5.5,-8.15]]);
face('#779194', [[-9,8.8,6],[-8,8.8,6],[-12,5.6,8.3],[-13,5.6,8.3]]);
// Faceted rocker panels, door crease, black diffuser, and a red tail light strip.
for (const z of [-8.2, 8.2]) {
  face('#253237', [[rear,-3,z],[22,-3,z*.77],[20,-1,z*.8],[-23,0,z]]);
  face('#eef2ec', [[-22,4,z],[10,3,z],[21,1.5,z*.8],[10,2,z],[-22,3,z]]);
  face('#7f8e93', [[-8,4,z],[-7,4,z],[-9,-.5,z],[-10,-.5,z]]);
  face('#ff5b55', [[rear-.15,3,z],[-21,3,z],[-21,4,z],[rear-.15,4,z]]);
  face('#f8ffe2', [[22,0,z*.79],[nose,0,z*.75],[nose,1,z*.75],[22,1.5,z*.79]]);
}
face('#f54b4c', [[rear-.2,2.4,-7],[rear-.2,2.4,7],[rear-.2,3.5,7],[rear-.2,3.5,-7]]);
// Dark underside, a visible silver battery spine, and four cold-gas nozzles.
face('#202d33', [[-22,-3.2,-6],[22,-3.2,-5],[22,-3.2,5],[-22,-3.2,6]]);
face('#64767a', [[-15,-3.4,-3],[15,-3.4,-3],[15,-3.4,3],[-15,-3.4,3]]);
for (const x of [-18, 17]) for (const z of [-6.5, 6.5]) {
  face('#b6c8c9', [[x-2,-3.6,z-1.5],[x+2,-3.6,z-1.5],[x+2,-3.6,z+1.5],[x-2,-3.6,z+1.5]]);
}
// Wheel faces are real polygons in the rolling model, so they move above the
// body when inverted and disappear behind the far side at quarter turns.
for (const x of [-17, 17]) for (const side of [-1, 1]) {
  const z = side * 8.5;
  const ring = (radius, depth) => Array.from({length: 10}, (_, i) => {
    const a = i * Math.PI / 5;
    return [x + Math.cos(a) * radius, -3 + Math.sin(a) * radius, depth];
  });
  face('#1f2d31', ring(5.7, z));
  face('#86999d', ring(4.2, z + side * .12));
  face('#bdcccd', ring(3.4, z + side * .24));
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * .4;
    face('#4d626b', [[x,-3,z+side*.35],[x+Math.cos(a)*3.7,-3+Math.sin(a)*3.7,z+side*.35],[x+Math.cos(a+.4)*2,-3+Math.sin(a+.4)*2,z+side*.35]]);
  }
  face('#2e424a', ring(1.1, z + side * .48));
}

export function drawRoadster(ctx, { x, y, facing = 1, roll = 0, scale = 1 }) {
  const faces = mesh.map(face => {
    const points = face.points.map(p => projectRoadsterPoint(p, roll));
    return { color: face.color, points, depth: points.reduce((sum,p) => sum+p.depth,0)/points.length };
  }).sort((a,b) => a.depth-b.depth);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing * scale, scale);
  for (const face of faces) {
    ctx.fillStyle = face.color;
    ctx.beginPath();
    face.points.forEach((p, i) => i ? ctx.lineTo(Math.round(p.x), Math.round(p.y)) : ctx.moveTo(Math.round(p.x), Math.round(p.y)));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
