import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// シーン、カメラ、レンダラーのセットアップ
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
// パーティクルの数を3つのグループに分ける
const numParticlesPerGroup = 5000; // 合計15000個を3グループに

// 第1の波用のジオメトリ
const geometry1 = new THREE.BufferGeometry();
const positions1 = new Float32Array(numParticlesPerGroup * 3);
const originalPositions1 = new Float32Array(numParticlesPerGroup * 3);
const targetPositions1 = new Float32Array(numParticlesPerGroup * 3);

// 第2の波用のジオメトリ
const geometry2 = new THREE.BufferGeometry();
const positions2 = new Float32Array(numParticlesPerGroup * 3);
const originalPositions2 = new Float32Array(numParticlesPerGroup * 3);
const targetPositions2 = new Float32Array(numParticlesPerGroup * 3);

// 第3の波用のジオメトリを追加
const geometry3 = new THREE.BufferGeometry();
const positions3 = new Float32Array(numParticlesPerGroup * 3);
const originalPositions3 = new Float32Array(numParticlesPerGroup * 3);
const targetPositions3 = new Float32Array(numParticlesPerGroup * 3);

// 初期位置の設定に第3の波を追加
for (let i = 0; i < numParticlesPerGroup; i++) {
	// 第1の波の初期位置（水色の波 - 0x88ccff - 横方向の動き）
	const x1 = (Math.random() - 0.5) * 50;
	const y1 = (Math.random() - 0.5) * 0.5;
	const z1 = (Math.random() - 0.5) * 30;
	positions1[i * 3] = x1;
	positions1[i * 3 + 1] = y1;
	positions1[i * 3 + 2] = z1;
	originalPositions1[i * 3] = x1;
	originalPositions1[i * 3 + 1] = y1;
	originalPositions1[i * 3 + 2] = z1;

	// 第2の波の初期位置（ピンクの波 - 0xff88cc - 縦方向の動き）
	const x2 = (Math.random() - 0.5) * 50;
	const y2 = (Math.random() - 0.5) * 1.0; // 0.4から1.0に増加
	const z2 = (Math.random() - 0.5) * 40;
	positions2[i * 3] = x2;
	positions2[i * 3 + 1] = y2;
	positions2[i * 3 + 2] = z2;
	originalPositions2[i * 3] = x2;
	originalPositions2[i * 3 + 1] = y2;
	originalPositions2[i * 3 + 2] = z2;

	// 第3の波の初期位置（オレンジの波 - 0xff8844 - 斜め方向の動き）
	const x3 = (Math.random() - 0.5) * 50;
	const y3 = (Math.random() - 0.5) * 0.4;
	const z3 = (Math.random() - 0.5) * 40;
	positions3[i * 3] = x3;
	positions3[i * 3 + 1] = y3;
	positions3[i * 3 + 2] = z3;
	originalPositions3[i * 3] = x3;
	originalPositions3[i * 3 + 1] = y3;
	originalPositions3[i * 3 + 2] = z3;

	// 球形状の目標位置（両方のグループ用）
	const theta = Math.random() * Math.PI * 2;
	const phi = Math.acos(Math.random() * 2 - 1);
	const radius = 1.5;

	targetPositions1[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
	targetPositions1[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
	targetPositions1[i * 3 + 2] = radius * Math.cos(phi);

	targetPositions2[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
	targetPositions2[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
	targetPositions2[i * 3 + 2] = radius * Math.cos(phi);

	// 球形状の目標位置（第3のグループ用も追加）
	targetPositions3[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
	targetPositions3[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
	targetPositions3[i * 3 + 2] = radius * Math.cos(phi);
}

geometry1.setAttribute('position', new THREE.BufferAttribute(positions1, 3));
geometry2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
geometry3.setAttribute('position', new THREE.BufferAttribute(positions3, 3));

// 2つの異なる色のマテリアル
const material1 = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.02 });
const material2 = new THREE.PointsMaterial({ color: 0xff88cc, size: 0.02 });
const material3 = new THREE.PointsMaterial({ color: 0xff8844, size: 0.02 });

const points1 = new THREE.Points(geometry1, material1);
const points2 = new THREE.Points(geometry2, material2);
const points3 = new THREE.Points(geometry3, material3);

scene.add(points1);
scene.add(points2);
scene.add(points3);

// カメラの位置を調整
camera.position.set(0, 0, 5); // 正面からの視点に設定

// アニメーション用のフラグ
let isHolding = false;

// クリック長押し処理
document.addEventListener('mousedown', () => {
	isHolding = true;
	gsap.to(geometry1.attributes.position.array, {
		duration: 2,
		endArray: targetPositions1,
		ease: 'power2.out',
		onUpdate: () => (geometry1.attributes.position.needsUpdate = true),
	});
	gsap.to(geometry2.attributes.position.array, {
		duration: 2,
		endArray: targetPositions2,
		ease: 'power2.out',
		onUpdate: () => (geometry2.attributes.position.needsUpdate = true),
	});
	gsap.to(geometry3.attributes.position.array, {
		duration: 2,
		endArray: targetPositions3,
		ease: 'power2.out',
		onUpdate: () => (geometry3.attributes.position.needsUpdate = true),
	});
});

document.addEventListener('mouseup', () => {
	isHolding = false;
	// 回転をリセット
	points1.rotation.set(0, 0, 0);
	points2.rotation.set(0, 0, 0);
	points3.rotation.set(0, 0, 0);
	gsap.to(geometry1.attributes.position.array, {
		duration: 2,
		endArray: originalPositions1,
		ease: 'power2.out',
		onUpdate: () => (geometry1.attributes.position.needsUpdate = true),
	});
	gsap.to(geometry2.attributes.position.array, {
		duration: 2,
		endArray: originalPositions2,
		ease: 'power2.out',
		onUpdate: () => (geometry2.attributes.position.needsUpdate = true),
	});
	gsap.to(geometry3.attributes.position.array, {
		duration: 2,
		endArray: originalPositions3,
		ease: 'power2.out',
		onUpdate: () => (geometry3.attributes.position.needsUpdate = true),
	});
});

// EffectComposerのセットアップ
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// BokehPassの設定を調整
const bokehPass = new BokehPass(scene, camera, {
	focus: 5.0,
	aperture: 0.003,
	maxblur: 0.005,
	width: window.innerWidth,
	height: window.innerHeight,
});
composer.addPass(bokehPass);

// デバッグ用：カメラから球体までの距離を計算して表示
const spherePosition = new THREE.Vector3(0, 0, 0); // 球体の中心位置
const distance = camera.position.distanceTo(spherePosition);
console.log('Camera to sphere distance:', distance);

// GUI（デバッグ用コントロール）を追加
const gui = new GUI();
gui.add(bokehPass.uniforms.focus, 'value', 0, 10, 0.1).name('Focus');
gui.add(bokehPass.uniforms.aperture, 'value', 0, 0.01, 0.0001).name('Aperture');
gui.add(bokehPass.uniforms.maxblur, 'value', 0, 0.01, 0.0001).name('Max Blur');

// アニメーションループ
function animate() {
	requestAnimationFrame(animate);

	if (!isHolding) {
		const time = performance.now() * 0.002;

		// 第1の波の更新（横方向の波）
		const positions1 = geometry1.attributes.position.array;
		for (let i = 0; i < numParticlesPerGroup; i++) {
			const index = i * 3;
			// X軸方向の動き
			positions1[index] =
				originalPositions1[index] +
				Math.sin(time * 1.0 + positions1[index + 2] * 0.4) * 4.0;

			// Y軸方向の動きを追加
			positions1[index + 1] =
				originalPositions1[index + 1] +
				Math.cos(time * 0.8 + positions1[index] * 0.3) * 2.0; // 縦方向の動きを追加
		}
		geometry1.attributes.position.needsUpdate = true;

		// 第2の波の更新（縦方向の波）
		const positions2 = geometry2.attributes.position.array;
		for (let i = 0; i < numParticlesPerGroup; i++) {
			const index = i * 3;
			positions2[index + 1] =
				originalPositions2[index + 1] +
				Math.sin(time * 1.2 + positions2[index] * 0.5) * 6.0; // 振幅を3.0から6.0に増加
		}
		geometry2.attributes.position.needsUpdate = true;

		// 第3の波の更新（斜め方向の波）
		const positions3 = geometry3.attributes.position.array;
		for (let i = 0; i < numParticlesPerGroup; i++) {
			const index = i * 3;
			// 斜め方向の動きを作成（X軸とY軸の組み合わせ）
			positions3[index] =
				originalPositions3[index] +
				Math.cos(time * 1.5 + positions3[index + 1] * 0.4) * 1.5;
			positions3[index + 1] =
				originalPositions3[index + 1] +
				Math.sin(time * 1.5 + positions3[index] * 0.4) * 1.5;
		}
		geometry3.attributes.position.needsUpdate = true;
	} else {
		points1.rotation.y += 0.01;
		points2.rotation.y += 0.01;
		points3.rotation.y += 0.01;
	}

	// composerを使用してレンダリング
	composer.render();
}
animate();

// ウィンドウサイズ変更時の処理
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
});
