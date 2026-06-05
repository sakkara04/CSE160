// asgn5.js  —  Art Museum Restoration Game
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

function main() {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// camera settings
	const camera = new THREE.PerspectiveCamera(75, 2, 0.05, 300);
	camera.position.set(0, 5, 26);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 1.7, 0);
	controls.minDistance = 0.5;
	controls.maxDistance = 50;
	controls.maxPolarAngle = Math.PI * 0.85;
	controls.update();

	// keyboard controls
	const keys = {};
	window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
	window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

	const scene = new THREE.Scene();

	// skybox texture
	const bgTexture = new THREE.TextureLoader().load('art-wall.jpg', () => {
		bgTexture.mapping = THREE.EquirectangularReflectionMapping;
		bgTexture.colorSpace = THREE.SRGBColorSpace;
		scene.background = bgTexture;
	});

	// floor texture
	const planeSize = 80;
	const floorTexture = new THREE.TextureLoader().load('wood-floor.jpg');
	floorTexture.colorSpace = THREE.SRGBColorSpace;
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.magFilter = THREE.LinearFilter;
	floorTexture.repeat.set(planeSize / 8, planeSize / 8);

	const floor = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize), new THREE.MeshPhongMaterial({ map: floorTexture, side: THREE.DoubleSide, shininess: 80 })
	);
	floor.rotation.x = Math.PI * -0.5;
	floor.receiveShadow = true;
	scene.add(floor);

	// mosaic texture
	const mosaicTex = new THREE.TextureLoader().load('mosaic.png');
	mosaicTex.colorSpace = THREE.SRGBColorSpace;

	// material constants
	const marbleMat = new THREE.MeshPhongMaterial({ color: 0xe8e0d8, shininess: 120 });
	const darkMarbleMat = new THREE.MeshPhongMaterial({ color: 0x3a3035, shininess: 90 });
	const goldMat = new THREE.MeshPhongMaterial({ color: 0xd4a843, shininess: 200 });
	const bronzeMat = new THREE.MeshPhongMaterial({ color: 0x8c6230, shininess: 150 });
	const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.25, shininess: 300, side: THREE.DoubleSide });
	const woodMat = new THREE.MeshPhongMaterial({ color: 0x7a4e2d, shininess: 40 });
	const redMat = new THREE.MeshPhongMaterial({ color: 0x990000, shininess: 60 });

	// geometry constants
	const boxGeo = new THREE.BoxGeometry(1, 1, 1);
	const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 32);
	const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
	const torusGeo = new THREE.TorusGeometry(1, 0.3, 16, 64);
	const coneGeo = new THREE.ConeGeometry(1, 1, 32);

	function makeMesh(geo, mat, px, py, pz, sx = 1, sy = 1, sz = 1) {
		const m = new THREE.Mesh(geo, mat);
		m.position.set(px, py, pz);
		m.scale.set(sx, sy, sz);
		m.castShadow = true;
		m.receiveShadow = true;
		scene.add(m);
		return m;
	}

	// pillars
	[[-30, 20], [-30, -20], [30, 20], [30, -20], [-15, 35], [15, 35], [-15, -35], [15, -35], [-30, 0], [30, 0]].forEach(([x, z]) => {
			makeMesh(cylGeo, marbleMat, x, 9, z, 2, 18, 2);
			makeMesh(boxGeo, marbleMat, x, 0.6, z,4.5, 1.2, 4.5);
			makeMesh(boxGeo, marbleMat, x, 18.6, z, 4.5, 0.8, 4.5);
		});

	// beams
	makeMesh(boxGeo, marbleMat, 0, 20, 35, 62, 1.5, 2);
	makeMesh(boxGeo, marbleMat, 0, 20, -35, 62, 1.5, 2);
	makeMesh(boxGeo, marbleMat, -30, 20, 0, 2, 1.5, 68);
	makeMesh(boxGeo, marbleMat, 30, 20, 0, 2, 1.5, 68);

	// statue obj
	makeMesh(cylGeo, bronzeMat, 0, 0.3, 0, 4, 0.6, 4);
	makeMesh(cylGeo, bronzeMat, 0, 3, 0, 3, 5.4, 3);
	makeMesh(cylGeo, bronzeMat, 0, 6.3, 0, 4, 0.6, 4);

	const objLoader = new OBJLoader();
	objLoader.load('statue.obj', root => {
		root.scale.set(0.07, 0.07, 0.07);
		root.rotation.x = Math.PI / 2;
		root.rotation.y = Math.PI;
		root.position.set(0, 6.5, 0.5);
		root.traverse(child => {
			if (child.isMesh) {
				child.castShadow = true;
				child.material = marbleMat;
			}
		});
		scene.add(root);
	});

	// pedestals
	[[-20, -15], [20, -15], [-20, 15], [20, 15]].forEach(([x, z]) => {
		makeMesh(boxGeo, darkMarbleMat, x, 0.3, z, 4, 0.6, 4);
		makeMesh(boxGeo, darkMarbleMat, x, 3, z, 3, 5.4, 3);
		makeMesh(boxGeo, darkMarbleMat, x, 6, z, 4, 0.6, 4);
	});

	// benches
	[[-18, 0], [18, 0], [0, -18], [0, 18]].forEach(([x, z]) => {
		makeMesh(boxGeo, woodMat, x, 2, z, 8, 0.5, 2);
		makeMesh(boxGeo, woodMat, x - 3, 1, z, 0.5, 2, 2);
		makeMesh(boxGeo, woodMat, x + 3, 1, z, 0.5, 2, 2);
	});

	// pillar-top spheres
	const columnSphereMat = new THREE.MeshPhongMaterial({ color: 0x8c6230, shininess: 180 });
	[[-30, 20], [-30, -20], [30, 20], [30, -20], [-15, 35], [15, 35], [-15, -35], [15, -35], [-30, 0], [30, 0]].forEach(([x, z]) => makeMesh(sphereGeo, columnSphereMat, x, 20, z, 2, 2, 2));

	// obelisks
	[[-24, -28], [24, -28], [-24, 28], [24, 28]].forEach(([x, z]) => {
		makeMesh(boxGeo, darkMarbleMat, x, 10, z, 2, 20, 2);
		makeMesh(coneGeo, goldMat, x, 21, z, 1.7, 3, 1.7);
	});

	// rope and barriers
	[[-6, 6.75], [6, 6.75], [-6, -6.75], [6, -6.75]].forEach(([x, z]) => {
		makeMesh(cylGeo, goldMat, x, 3, z, 0.25, 6, 0.25);
		makeMesh(sphereGeo, goldMat, x, 6, z, 0.3, 0.3, 0.3);
	});
	const ropeGeo = new THREE.TorusGeometry(9, 0.1, 8, 60, Math.PI);
	const rope1 = new THREE.Mesh(ropeGeo, redMat);
	rope1.position.set(0, 5, 0); rope1.rotation.x = Math.PI / 2; rope1.rotation.z = Math.PI / 2;
	scene.add(rope1);
	const rope2 = new THREE.Mesh(ropeGeo, redMat);
	rope2.position.set(0, 5, 0); rope2.rotation.x = Math.PI / 2; rope2.rotation.z = -Math.PI / 2;
	scene.add(rope2);

	// lighting 
	scene.add(new THREE.AmbientLight(0xfff5e0, 0.4));
	scene.add(new THREE.HemisphereLight(0xfff9e6, 0x403030, 0.6));

	const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
	dirLight.position.set(20, 50, 30);
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 2048;
	dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 200;
	dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -60;
	dirLight.shadow.camera.right = dirLight.shadow.camera.top = 60;
	scene.add(dirLight);

	const statueLight = new THREE.PointLight(0xfff5e0, 2, 30);
	statueLight.position.set(0, 12, 0);
	scene.add(statueLight);

	const spotLights = [[-20, 0, -15], [20, 0, -15], [-20, 0, 15], [20, 0, 15]].map((pos, i) => {
		const colors = [0xffeecc, 0xfff0dd, 0xffddb0, 0xffe8c0];
		const spot = new THREE.SpotLight(colors[i], 3, 30, Math.PI / 8, 0.3, 1.5);
		spot.position.set(pos[0], 22, pos[2]);
		spot.castShadow = true;
		const tgt = new THREE.Object3D();
		tgt.position.set(...pos);
		scene.add(tgt);
		spot.target = tgt;
		scene.add(spot);
		return spot;
	});

	const entranceLight = new THREE.PointLight(0xffd280, 1.5, 30);
	entranceLight.position.set(0, 15, 35);
	scene.add(entranceLight);

	const PEDESTAL_TOP_Y = 6.6;
	const PEDESTAL_TARGETS = [
		new THREE.Vector3(-20, PEDESTAL_TOP_Y, -15),
		new THREE.Vector3(20, PEDESTAL_TOP_Y, -15),
		new THREE.Vector3(-20, PEDESTAL_TOP_Y, 15),
		new THREE.Vector3(20, PEDESTAL_TOP_Y, 15),
	];

	// artifact constants
	const artifactDefs = [
		{
			id: 'mosaic',
			name: 'Pompeii Mosaic Fragment',
			targetIndex: 0,
			description: 'A fragment of detailed floor mosaic excavated from an ancient Roman house buried by the eruption of Mount Vesuvius in 79 AD.\nRoman, c. 1st century AD',
			scatterPos: new THREE.Vector3(24, 2, 15),
			scatterRot: new THREE.Euler(0, 0.8, 0),
			icon: '🔹', label: 'Mosaic',
		},
		{
			id: 'vase',
			name: 'Aztec Clay Vase ',
			targetIndex: 2,
			description: 'A painted clay vase used in Aztec religious ceremonies.\nAztec, c. 1400 AD',
			scatterPos: new THREE.Vector3(1.75, 9, -1.5),
			scatterRot: new THREE.Euler(0, -0.5, 0),
			icon: '🏺', label: 'Vase',
		},
		{
			id: 'scroll',
			name: 'Egyptian Papyrus Scroll',
			targetIndex: 1,
			description: 'An ancient Egyptian scroll enscribed with land records and made from reeds found along the Nile.\nEgyptian, c. 240 BC',
			scatterPos: new THREE.Vector3(-20, 2, -4),
			scatterRot: new THREE.Euler(0, 0.4, 0.15),
			icon: '📜', label: 'Scroll',
		},
		{
			id: 'necklace',
			name: 'Sapphiric Golden Necklace',
			targetIndex: 3,
			description: 'A gold necklace set with a rare Kashmiri sapphire, likely worn by Mughal Empire royalty.\nIndian, c. 16th century AD',
			scatterPos: new THREE.Vector3(26, 2, -25),
			scatterRot: new THREE.Euler(0, 1.2, 0),
			icon: '💎', label: 'Necklace',
		},
	];

	// artifact builder
	const artifacts = {};

	function buildArtifacts() {
		{
			const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ map: mosaicTex }));
			mesh.castShadow = true;
			scene.add(mesh);
			artifacts['mosaic'] = { group: mesh };
		}

		{
			const group = new THREE.Group();
			const terracottaMat = new THREE.MeshPhongMaterial({ color: 0xc05a20, shininess: 60 });
			const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.5, 2.5, 24), terracottaMat);
			const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1, 24), terracottaMat);
			neck.position.y = 1.75;
			const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 0.25, 24), terracottaMat);
			lip.position.y = 2.3;
			
			const deco = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.61, 1.2, 24, 1, true), new THREE.MeshPhongMaterial({ color: 0x1a0a00, shininess: 30, side: THREE.DoubleSide }));
			deco.position.y = 0.2;
			group.add(body, neck, lip, deco);
			[body, neck, lip, deco].forEach(m => m.castShadow = true);
			scene.add(group);
			artifacts['vase'] = { group };
		}

		{
			const group = new THREE.Group();
			const rollMat = new THREE.MeshPhongMaterial({ color: 0xd4b483, shininess: 30 });
			const capMat = new THREE.MeshPhongMaterial({ color: 0x8b5e3c, shininess: 60 });
			const flapMat = new THREE.MeshPhongMaterial({ color: 0xe8cfa0, shininess: 15, side: THREE.DoubleSide });
	
			const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.4, 24), rollMat);
			roll.rotation.z = Math.PI / 2;
			roll.castShadow = true;
			group.add(roll);

			[-1.25, 1.25].forEach(x => {
				const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.18, 24), capMat);
				cap.rotation.z = Math.PI / 2;
				cap.position.x = x;
				cap.castShadow = true;
				group.add(cap);
			});

			const flap = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), flapMat);
			flap.position.set(0, -0.9, 0.1);
			flap.rotation.x = Math.PI / 12;
			group.add(flap);

			scene.add(group);
			artifacts['scroll'] = { group };
		}

		{
			const group = new THREE.Group();
			const goldNeckMat = new THREE.MeshPhongMaterial({ color: 0xd4a843, shininess: 220 });
			const gemMat = new THREE.MeshPhongMaterial({ color: 0x1a4fff, shininess: 400, specular: 0xffffff });
			const chainMat = new THREE.MeshPhongMaterial({ color: 0xc89b30, shininess: 180 });

			for (let i = 0; i < 22; i++) {
				const t = i / 21;
				const angle = Math.PI + t * Math.PI;
				const link = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 16), chainMat);
				link.position.set(Math.cos(angle) * 0.75, Math.sin(angle) * 0.8, 0);
				link.rotation.z = angle + Math.PI / 2;
				link.castShadow = true;
				group.add(link);
			}

			const pendant = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.08, 32), goldNeckMat);
			pendant.rotation.x = Math.PI / 2;
			pendant.castShadow = true;
			pendant.position.set(0, -1.1, 0);
			group.add(pendant);

			const gem = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), gemMat);
			gem.position.z = 0.12;
			gem.castShadow = true;
			gem.position.set(0, -1.1, 0.03);
			group.add(gem);

			for (let i = 0; i < 8; i++) {
				const a = (i / 8) * Math.PI * 2;
				const ag = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12),
					new THREE.MeshPhongMaterial({ color: 0xff3333, shininess: 300, specular: 0xffffff }));
				ag.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3 - 1.1, 0.06);
				group.add(ag);
			}

			scene.add(group);
			artifacts['necklace'] = { group };
		}

		artifactDefs.forEach(def => {
			const art = artifacts[def.id];
			if (art) {
				art.group.position.copy(def.scatterPos);
				if (def.scatterRot) art.group.rotation.copy(def.scatterRot);
			}
		});
	}

	buildArtifacts();

	// pedestal targets for each corresponding artifact
	const targetZones = [];
	artifactDefs.forEach(def => {
		const pos = PEDESTAL_TARGETS[def.targetIndex].clone();
		const hMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 4), new THREE.MeshBasicMaterial({ visible: false }));
		hMesh.position.copy(pos);
		hMesh.position.y += 1.5;
		scene.add(hMesh);
		targetZones.push({ mesh: hMesh, defId: def.id });
	});

	// game state vars
	let gameState = 'idle';
	let selectedId = null;
	let matchedCount = 0;
	const matched = {};
	const found = {};
	let gameStartTime = 0;
	let elapsedSeconds = 0;
	let timerRunning = false;

	// DOM constants
	const statEl = document.getElementById('stat');
	const statTime = document.getElementById('stat-time');
	const statRestored = document.getElementById('stat-restored');
	const statRemaining = document.getElementById('stat-remaining');
	const placardEl = document.getElementById('placard');
	const placardTitle = document.getElementById('placard-title');
	const placardText = document.getElementById('placard-text');
	const invBarEl = document.getElementById('invBar');
	const winEl = document.getElementById('win');
	const winMsgEl = document.getElementById('win-msg');
	const hintEl = document.getElementById('hint');

	// artifact description placard handling
	function showPlacard(title, text) {
		placardTitle.textContent = title;
		placardText.textContent = text;
		placardEl.style.display = 'block';
	}
	function hidePlacard() { placardEl.style.display = 'none'; }
	document.getElementById('placard-close').addEventListener('click', hidePlacard);

	// status bar handling
	function updateStat() {
		statRestored.textContent = matchedCount;
		statRemaining.textContent = artifactDefs.length - matchedCount;
	}
	function formatTime(s) {
		const m = Math.floor(s / 60), sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	// inventory builder
	function buildInvBar() {
		invBarEl.innerHTML = '';
		artifactDefs.forEach((def, i) => {
			const slot = document.createElement('div');
			slot.className = 'slot locked';
			slot.dataset.id = def.id;
			slot.innerHTML = `
				<span class="slot-q">${i + 1}</span>
				<span class="slot-lock">?</span>
				<span class="slot-icon">${def.icon}</span>
				<span class="slot-label">${def.label}</span>`;
			slot.addEventListener('click', () => {
				if (matched[def.id] || !found[def.id]) return;
				selectedId === def.id ? deselectArtifact() : selectArtifact(def.id);
			});
			invBarEl.appendChild(slot);
		});
	}

	// inventory handling
	function refreshSlot(id) {
		const slot = invBarEl.querySelector(`[data-id="${id}"]`);
		if (!slot) return;
		slot.className = 'slot';
		if (!found[id]) slot.classList.add('locked');
		else if (matched[id]) slot.classList.add('matched');
		else if (selectedId === id) slot.classList.add('selected');
	}
	function refreshAllSlots() { artifactDefs.forEach(d => refreshSlot(d.id)); }

	function selectArtifact(id) {
		deselectArtifact();
		const wasFound = found[id];
		found[id] = true;
		selectedId = id;
		artifacts[id].group.visible = false;
		refreshSlot(id);
	}

	function deselectArtifact() {
		if (selectedId) {
			if (!matched[selectedId]) artifacts[selectedId].group.visible = true;
			selectedId = null;
			refreshAllSlots();
		}
	}

	// artifact placement handling
	function attemptPlace(targetDefId) {
		if (selectedId === targetDefId) {
			placeArtifact(artifactDefs.find(d => d.id === selectedId));
		} else {
			const slot = invBarEl.querySelector(`[data-id="${selectedId}"]`);
			if (slot) {
				slot.style.outline = '2px solid red';
				setTimeout(() => {
					slot.style.outline = '';
				}, 800);
			}
		}
	}

	function placeArtifact(def) {
		const art = artifacts[def.id];
		art.group.visible = true;
		animateTo(art.group, PEDESTAL_TARGETS[def.targetIndex]);
		matched[def.id] = true;
		matchedCount++;
		deselectArtifact();
		hidePlacard();
		updateStat();
		refreshSlot(def.id);

		setTimeout(() => showPlacard('✓ ' + def.name, def.description), 600);

		if (matchedCount >= artifactDefs.length) setTimeout(triggerWin, 1800);
	}

	function animateTo(group, targetPos) {
		const start = group.position.clone();
		const dest = new THREE.Vector3(targetPos.x, targetPos.y + 1.1, targetPos.z);
		let progress = 0;

		function step() {
			progress = Math.min(progress + 0.016, 1);
			const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
			group.position.x = start.x + (dest.x - start.x) * ease;
			group.position.z = start.z + (dest.z - start.z) * ease;
			group.position.y = start.y + (dest.y - start.y) * ease + Math.sin(progress * Math.PI) * 8;
			group.rotation.y += 0.04;
			if (progress < 1) requestAnimationFrame(step);
			else { group.position.copy(dest); group.rotation.set(0, 0, 0); }
		}
		step();
	}

	// game win handling
	function triggerWin() {
		gameState = 'won';
		timerRunning = false;
		const s = elapsedSeconds;
		winMsgEl.textContent = `Time: ${formatTime(s)}`;
		winEl.classList.remove('hidden');
	}

	document.getElementById('explore-btn').addEventListener('click', () => {
		winEl.classList.add('hidden');
		gameState = 'explore';
		invBarEl.classList.remove('visible');
		hintEl.textContent = 'Click top of any pedestal to learn about its artifact';
		hintEl.style.opacity = '0.5';
	});

	// game start handling
	document.getElementById('start-btn').addEventListener('click', () => {
		document.getElementById('intro').classList.add('hidden');
		statEl.classList.remove('hidden');
		buildInvBar();
		invBarEl.classList.add('visible');
		updateStat();
		gameState = 'playing';
		gameStartTime = performance.now();
		timerRunning = true;
		hintEl.style.opacity = '0.5';
		hintEl.classList.remove('hidden');
	});

	// raycasting/click detection
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function getArtifactMeshes() {
		const meshes = [];
		artifactDefs.forEach(def => {
			if (matched[def.id]) return;
			artifacts[def.id].group.traverse(c => { if (c.isMesh) meshes.push(c); });
		});
		return meshes;
	}

	function findArtifactId(mesh) {
		for (const def of artifactDefs) {
			if (matched[def.id]) continue;
			let hit = false;
			artifacts[def.id].group.traverse(c => { if (c === mesh) hit = true; });
			if (hit) return def.id;
		}
		return null;
	}

	function findTargetDefId(mesh) {
		for (const tz of targetZones) { if (tz.mesh === mesh) return tz.defId; }
		return null;
	}

	canvas.addEventListener('pointerdown', e => { canvas._px = e.clientX; canvas._py = e.clientY; });
	canvas.addEventListener('pointerup', e => {
		if (Math.hypot(e.clientX - canvas._px, e.clientY - canvas._py) > 5) return;
		if (gameState !== 'playing' && gameState !== 'explore') return;

		const rect = canvas.getBoundingClientRect();
		pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = ((e.clientY - rect.top) / rect.height) * -2 + 1;
		raycaster.setFromCamera(pointer, camera);

		if (gameState === 'explore') {
			const hits = raycaster.intersectObjects(targetZones.map(tz => tz.mesh), false);
			if (hits.length) {
				const def = artifactDefs.find(d => d.id === findTargetDefId(hits[0].object));
				if (def) showPlacard(def.name, def.description);
			} else hidePlacard();
			return;
		}

		const artHits = raycaster.intersectObjects(getArtifactMeshes(), false);
		if (artHits.length) {
			const id = findArtifactId(artHits[0].object);
			if (id) { selectArtifact(id); hidePlacard(); }
			return;
		}

		const tgtHits = raycaster.intersectObjects(targetZones.map(tz => tz.mesh), false);
		if (tgtHits.length) {
			const defId = findTargetDefId(tgtHits[0].object);
			if (!defId) return;
			const def = artifactDefs.find(d => d.id === defId);
			if (selectedId) {
				attemptPlace(defId);
			} else {
				showPlacard(
					matched[defId] ? def.name : '?',
					def.description
				);
			}
			return;
		}

		deselectArtifact();
		hidePlacard();
	});

	// canvas resize check
	function resizeCheck() {
		const c = renderer.domElement;
		if (c.width !== c.clientWidth || c.height !== c.clientHeight) {
			renderer.setSize(c.clientWidth, c.clientHeight, false);
			camera.aspect = c.clientWidth / c.clientHeight;
			camera.updateProjectionMatrix();
		}
	}

	// main render loop
	let prevTime = 0;
	function render(time) {
		time *= 0.001;
		prevTime = time;

		resizeCheck();

		if (gameState === 'playing' || gameState === 'explore') {
			const speed = 0.18;
			const fwd = new THREE.Vector3();
			const right = new THREE.Vector3();
			camera.getWorldDirection(fwd);
			fwd.y = 0; fwd.normalize();
			right.crossVectors(fwd, camera.up).normalize();

			const move = new THREE.Vector3();
			if (keys['w']) move.addScaledVector(fwd, speed);
			if (keys['s']) move.addScaledVector(fwd, -speed);
			if (keys['a']) move.addScaledVector(right, -speed);
			if (keys['d']) move.addScaledVector(right, speed);
			camera.position.add(move);
			controls.target.add(move);

			if (keys['q'] || keys['e']) {
				const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
				dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), keys['q'] ? 0.02 : -0.02);
				controls.target.copy(camera.position).add(dir);
			}

			controls.update();
		}

		if (timerRunning) {
			elapsedSeconds = (performance.now() - gameStartTime) / 1000;
			statTime.textContent = formatTime(elapsedSeconds);
		}

		const spinSpeed = 0.5;
		['mosaic', 'vase', 'scroll', 'necklace'].forEach(id => {
			if (!matched[id] && artifacts[id]) {
				artifacts[id].group.rotation.y = time * spinSpeed;
			}
		});

		statueLight.intensity = 1.8 + Math.sin(time * 1.2) * 0.3;
		spotLights.forEach((s, i) => { s.intensity = 2.5 + 0.5 * Math.sin(time * 0.7 + i * 1.2); });

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

main();