import * as CANNON from "cannon-es";
import {GUI} from "dat.gui";
import {useEffect, useRef} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/Addons.js";

function Move() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const guiRef = useRef<GUI | null>(null);

  useEffect(() => {
    // Cannon.js 설정
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // 물리 재질 설정
    const concreteMaterial = new CANNON.Material("concrete");
    const plasticMaterial = new CANNON.Material("plastic");
    const contactMaterial = new CANNON.ContactMaterial(
      concreteMaterial,
      plasticMaterial,
      {
        friction: 1.0,
        restitution: 0.5,
      }
    );
    world.addContactMaterial(contactMaterial);

    // Cannon.js 구체 생성
    const sphereRadius = 0.5;
    const sphereShape = new CANNON.Sphere(sphereRadius);
    const sphereBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: sphereShape,
      material: plasticMaterial,
      linearDamping: 0.7,
    });
    world.addBody(sphereBody);

    // 바닥 생성
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: floorShape,
      material: concreteMaterial,
    });
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI * 0.5
    );
    world.addBody(floorBody);

    // Three.js 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    // Three.js 구체와 바닥 생성
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 조명 설정
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // OrbitControls 설정
    const controls = new OrbitControls(camera, renderer.domElement);

    // dat.GUI 설정
    const gui = new GUI();
    guiRef.current = gui;

    const sphereFolder = gui.addFolder("Sphere");
    sphereFolder.add(sphereBody.position, "x", -10, 10).name("Position X");
    sphereFolder.add(sphereBody.position, "y", -10, 10).name("Position Y");
    sphereFolder.add(sphereBody.position, "z", -10, 10).name("Position Z");
    sphereFolder
      .addColor({color: sphereMaterial.color.getHex()}, "color")
      .name("Color")
      .onChange((value) => sphereMaterial.color.set(value));
    sphereFolder.open();

    const floorFolder = gui.addFolder("Floor");
    floorFolder
      .addColor({color: floorMaterial.color.getHex()}, "color")
      .name("Color")
      .onChange((value) => floorMaterial.color.set(value));
    floorFolder.open();

    // 애니메이션 및 키보드 이벤트
    const clock = new THREE.Clock();
    const keyboardState = {left: false, right: false, up: false, down: false};

    const handleKeyDown = (event: any) => {
      switch (event.keyCode) {
        case 37:
          keyboardState.left = true;
          break;
        case 39:
          keyboardState.right = true;
          break;
        case 38:
          keyboardState.up = true;
          break;
        case 40:
          keyboardState.down = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: any) => {
      switch (event.keyCode) {
        case 37:
          keyboardState.left = false;
          break;
        case 39:
          keyboardState.right = false;
          break;
        case 38:
          keyboardState.up = false;
          break;
        case 40:
          keyboardState.down = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    const animation = () => {
      const deltaTime = clock.getDelta();
      const speed = 2;

      // 키보드 입력에 따라 이동
      const movingDirection = new THREE.Vector3(
        (Number(keyboardState.right) - Number(keyboardState.left)) * speed,
        0,
        (Number(keyboardState.down) - Number(keyboardState.up)) * speed
      );

      if (movingDirection.length() > 0) {
        sphereBody.velocity.set(
          movingDirection.x,
          sphereBody.velocity.y,
          movingDirection.z
        );
      }

      world.step(1 / 60, deltaTime, 3);
      sphere.position.copy(sphereBody.position);
      sphere.quaternion.copy(sphereBody.quaternion);

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animation);
    };

    animation(); // 애니메이션 시작

    return () => {
      gui.destroy();
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div ref={containerRef} style={{width: "100vw", height: "100vh"}}></div>
  );
}

export default Move;
