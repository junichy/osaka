// import { gsap } from 'gsap';

// シーン、カメラ、レンダラーのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// パーティクルの数
const numParticles = 10000;

// ジオメトリ、マテリアルの作成
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(numParticles * 3);
const targetPositions = new Float32Array(numParticles * 3);
const originalPositions = new Float32Array(numParticles * 3);

for (let i = 0; i < numParticles; i++) {
	const x = (Math.random() - 0.5) * 20;
	const y = (Math.random() - 0.5) * 10;
	const z = (Math.random() - 0.5) * 5;

	positions[i * 3] = x;
	positions[i * 3 + 1] = y;
	positions[i * 3 + 2] = z;

	originalPositions[i * 3] = x;
	originalPositions[i * 3 + 1] = y;
	originalPositions[i * 3 + 2] = z;

	// 球の座標を計算（球の形に整列）
	const theta = Math.random() * Math.PI * 2;
	const phi = Math.acos(Math.random() * 2 - 1);
	const radius = 1.5;

	targetPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
	targetPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
	targetPositions[i * 3 + 2] = radius * Math.cos(phi);
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// ドットのサイズを小さく設定
const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
const points = new THREE.Points(geometry, material);
scene.add(points);

// カメラの位置を調整
camera.position.z = 5;

// アニメーション用のフラグ
let isHolding = false;

// クリック長押し処理
document.addEventListener('mousedown', () => {
	isHolding = true;
	gsap.to(geometry.attributes.position.array, {
		duration: 2,
		endArray: targetPositions,
		ease: 'power2.out',
		onUpdate: () => (geometry.attributes.position.needsUpdate = true),
	});
});

document.addEventListener('mouseup', () => {
	isHolding = false;
	gsap.to(geometry.attributes.position.array, {
		duration: 2,
		endArray: originalPositions,
		ease: 'power2.out',
		onUpdate: () => (geometry.attributes.position.needsUpdate = true),
	});
});

// アニメーションループ
function animate() {
	requestAnimationFrame(animate);

	// 波の動き (isHolding じゃないときだけ)
	if (!isHolding) {
		const positions = geometry.attributes.position.array;
		const time = performance.now() * 0.002;
		for (let i = 0; i < numParticles; i++) {
			const index = i * 3;
			positions[index + 1] =
				originalPositions[index + 1] +
				Math.sin(positions[index] * 0.5 + time) * 0.5;
		}
		geometry.attributes.position.needsUpdate = true;
	}

	renderer.render(scene, camera);
}
animate();
