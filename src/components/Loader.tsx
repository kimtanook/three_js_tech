import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import * as THREE from "three";
import {GLTF, GLTFLoader, OrbitControls} from "three/examples/jsm/Addons.js";

function Loader() {
  // 모델링 ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 조명 x좌표
  const [xPosition, setXPosition] = useState(5000);

  const [lightState, setLightState] = useState<THREE.DirectionalLight | null>(
    null
  );

  // 조명위치 조작
  const xLightPosition = (value: number | number[]) => {
    if (lightState) {
      const xValue = Array.isArray(value) ? value[0] : value;
      setXPosition(xValue);
      lightState.position.set(
        xPosition,
        lightState.position.y,
        lightState.position.z
      );
    }
  };

  useEffect(() => {
    // 씬 생성
    let scene = new THREE.Scene();
    // 렌더러 설정
    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 카메라 설정
    let camera = new THREE.PerspectiveCamera(30, 1);
    camera.position.set(0, 0, 10);

    // OrbitControls 기본 값 생성
    const controls = new OrbitControls(camera, renderer.domElement);

    // 모델을 로드하고 렌더링하는 함수
    const loadModel = () => {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.firstChild.remove();
        }
      }

      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      // 그림자맵 활성화
      renderer.shadowMap.enabled = true;

      // 그림자가 길게 나오도록 설정
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const loader = new GLTFLoader();

      loader.load(
        // 모델의 경로
        "/public/building/scene.gltf",
        // 로드가 완료되었을 때의 콜백 함수
        (gltf: GLTF) => {
          // 로드된 모델을 씬에 추가
          scene.add(gltf.scene);

          // 전체적인 조명 추가
          const ambientLight = new THREE.AmbientLight("#ffffff", 0.05);
          scene.add(ambientLight);

          // 특정 좌표에서 비추는 조명과 그림자 추가
          const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
          directionalLight.position.set(xPosition, 10000, 1); // 조명 위치 (x, y, z)
          directionalLight.castShadow = true; // 그림자 유무
          directionalLight.shadow.mapSize.width = 2048; // 그림자 해상도
          directionalLight.shadow.mapSize.height = 2048; // 그림자 해상도
          directionalLight.shadow.camera.near = 1; // 그림자 카메라의 near 클리핑 평면
          directionalLight.shadow.camera.far = 10000; // 그림자 카메라의 far 클리핑 평면
          scene.add(directionalLight);

          gltf.scene.traverse(function (object: any) {
            if (object.isMesh) {
              // 모델에 그림자 속성 적용
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });

          // 모델 크기 조정
          const box = new THREE.Box3().setFromObject(scene);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 3 / maxDim;
          scene.scale.multiplyScalar(scaleFactor);
          scene.position.sub(center.multiplyScalar(scaleFactor));

          // OrbitControls, DirectionalLight의 속성값들을 동적으로 관리하기 위한 setState
          setLightState(directionalLight);

          // 렌더링 루프
          const animate = () => {
            requestAnimationFrame(animate);
            if (renderer && scene && camera) {
              controls.update(); // OrbitControls 업데이트
              renderer.render(scene, camera);
            }
          };

          // 모델 로드 후 렌더링 루프 시작
          animate();
        },
        (progressEvent) => {
          // 로딩 정보
          // const progress = progressEvent.loaded / progressEvent.total;
          // console.log(`Model loading progress: ${Math.round(progress * 100)}%`);
        },
        (error) => {
          console.error("Error loading model:", error);
        }
      );
    };
    loadModel();

    // 컴포넌트가 언마운트될 때 Three.js 리소스 정리
    return () => {
      if (renderer) {
        renderer.dispose();
        console.log("renderer : ", renderer);
        console.log("모델링 리소스 정리");
      }
    };
  }, []);

  return (
    <>
      <SliderBox>
        <Slider
          min={-10000}
          max={10000}
          defaultValue={xPosition}
          step={100}
          onChange={xLightPosition}
        />
      </SliderBox>
      <ModelBox ref={containerRef} />
    </>
  );
}

export default Loader;

const SliderBox = styled.div`
  position: absolute;
  left: 2rem;
  bottom: 2rem;
  width: 50%;
`;

const ModelBox = styled.div`
  display: flex;
  justify-content: center;
`;
