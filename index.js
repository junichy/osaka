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
// パーティクルの数
// パーティクルの数
const numParticles = 15000;
// ジオメトリ、マテリアルの作成
// ジオメトリ、マテリアルの作成
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(numParticles * 3);
const targetPositions = new Float32Array(numParticles * 3);
const originalPositions = new Float32Array(numParticles * 3);
// カラフルな色を設定するためのカラー属性を追加
// カラフルな色を設定するためのカラー属性を追加
const colors = new Float32Array(numParticles * 3);
for (let i = 0; i < numParticles; i++) {
	const x = (Math.random() - 0.5) * 50;
	const y = (Math.random() - 0.5) * 0.4;
	const z = (Math.random() - 0.5) * 40;
	positions[i * 3] = x;
	positions[i * 3 + 1] = y;
	positions[i * 3 + 2] = z;
	originalPositions[i * 3] = x;
	originalPositions[i * 3 + 1] = y;
	originalPositions[i * 3 + 2] = z;
	// 球の座標を計算（球の形に整列）
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
camera.position.set(0, 0, 5); // 正面からの視点に設定

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
	// 回転をリセット
	points.rotation.set(0, 0, 0);
	gsap.to(geometry.attributes.position.array, {
		duration: 2,
		endArray: originalPositions,
		ease: 'power2.out',
		onUpdate: () => (geometry.attributes.position.needsUpdate = true),
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

	// 球体までの距離を動的に計算
	const spherePosition = new THREE.Vector3(0, 0, 0);
	const distance = camera.position.distanceTo(spherePosition);
	bokehPass.uniforms.focus.value = distance;

	// 波の動き (isHolding じゃないときだけ)
	if (!isHolding) {
		const positions = geometry.attributes.position.array;
		const time = performance.now() * 0.002;
		for (let i = 0; i < numParticles; i++) {
			const index = i * 3;
			positions[index + 1] =
				originalPositions[index + 1] +
				Math.sin(positions[index] * 1.0 + time) * 0.5;
			positions[index] =
				originalPositions[index] +
				Math.sin(positions[index + 1] * 1.0 + time) * 0.5;
		}
		geometry.attributes.position.needsUpdate = true;
	} else {
		// 球体がY軸周りに回転する
		points.rotation.y += 0.01; // Y軸周りに回転
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
