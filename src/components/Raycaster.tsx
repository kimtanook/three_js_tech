import {useEffect, useRef} from "react"; // React의 useEffect와 useRef 훅 가져옴
import * as THREE from "three"; // Three.js 라이브러리 가져옴
import {OrbitControls} from "three/examples/jsm/Addons.js"; // OrbitControls 가져옴

const Raycaster = () => {
  const containerRef = useRef<HTMLDivElement | null>(null); // Three.js 장면을 렌더링할 DOM 요소 참조
  const raycaster = useRef(new THREE.Raycaster()); // 레이캐스터 초기화
  const mouse = useRef(new THREE.Vector2()); // 마우스 위치 저장용 Vector2 객체 생성
  const plane = useRef(new THREE.Plane()); // 드래그용 평면 생성
  const pNormal = useRef(new THREE.Vector3(0, 1, 0)); // 평면의 법선 벡터 정의
  const planeIntersect = useRef(new THREE.Vector3()); // 평면과 레이의 교차점 저장용 벡터 생성
  const pIntersect = useRef(new THREE.Vector3()); // 드래그 시작 지점 저장용 벡터 생성
  const shift = useRef(new THREE.Vector3()); // 드래그 시 객체 위치 변화량 저장
  const isDragging = useRef(false); // 드래그 상태 저장용 ref 객체 생성
  const dragObject = useRef<THREE.Object3D | null>(null); // 드래그 중인 객체 저장용 ref 객체 생성

  useEffect(() => {
    const scene = new THREE.Scene(); // 새로운 Three.js 장면 생성
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    ); // 원근 카메라 생성
    camera.position.set(3, 5, 8); // 카메라 위치 설정
    camera.lookAt(scene.position); // 카메라가 장면의 중심 바라봄

    const renderer = new THREE.WebGLRenderer({antialias: true}); // WebGL 렌더러 생성
    renderer.setSize(window.innerWidth, window.innerHeight); // 렌더러 크기 설정
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement); // 렌더러의 DOM 요소를 containerRef에 추가
    }

    const controls = new OrbitControls(camera, renderer.domElement); // 카메라 컨트롤 설정
    scene.add(new THREE.GridHelper(10, 10)); // 장면에 그리드 헬퍼 추가

    // Cube Geometry and Material
    const cubes = [
      new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1), // 1x1x1 크기 박스 기하학 생성
        new THREE.MeshBasicMaterial({color: "red"}) // 빨간색 재질 사용
      ),
      new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1), // 1x1x1 크기 박스 기하학 생성
        new THREE.MeshBasicMaterial({color: "blue"}) // 파란색 재질 사용
      ),
      new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1), // 1x1x1 크기 박스 기하학 생성
        new THREE.MeshBasicMaterial({color: "green"}) // 녹색 재질 사용
      ),
    ];

    cubes[0].position.set(-1, 0.5, 0); // 첫 번째 큐브 위치 설정
    cubes[1].position.set(1, 0.5, 0); // 두 번째 큐브 위치 설정
    cubes[2].position.set(0.5, 0.5, 2); // 세 번째 큐브 위치 설정

    cubes.forEach((cube) => scene.add(cube)); // 모든 큐브를 장면에 추가

    const onMouseMove = (event: any) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1; // 마우스 X 좌표 정규화
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1; // 마우스 Y 좌표 정규화
      raycaster.current.setFromCamera(mouse.current, camera); // 레이캐스터의 시작점 설정

      if (isDragging.current && dragObject.current) {
        // 드래그 중인 경우
        raycaster.current.ray.intersectPlane(
          plane.current,
          planeIntersect.current // 레이와 평면의 교차점 계산
        );
        dragObject.current.position.addVectors(
          planeIntersect.current,
          shift.current // 드래그 중인 객체 위치 업데이트
        );
      }
    };

    const onMouseDown = () => {
      const intersects = raycaster.current.intersectObjects(cubes); // 큐브와의 교차점 검사
      if (intersects.length > 0) {
        // 교차점 발견 시
        controls.enabled = false; // 카메라 컨트롤 비활성화
        pIntersect.current.copy(intersects[0].point); // 첫 번째 교차점 위치 복사
        plane.current.setFromNormalAndCoplanarPoint(
          pNormal.current,
          pIntersect.current // 평면 설정
        );
        shift.current.subVectors(
          intersects[0].object.position,
          intersects[0].point // 드래그 시 객체 위치 변화 계산
        );
        isDragging.current = true; // 드래그 상태 업데이트
        dragObject.current = intersects[0].object; // 드래그 중인 객체 설정
      }
    };

    const onMouseUp = () => {
      isDragging.current = false; // 드래그 상태 업데이트
      dragObject.current = null; // 드래그 중인 객체 초기화
      controls.enabled = true; // 카메라 컨트롤 활성화
    };

    const render = () => {
      requestAnimationFrame(render); // 다음 프레임 요청하여 렌더링 반복
      renderer.render(scene, camera); // 장면과 카메라로 렌더링
    };

    window.addEventListener("pointermove", onMouseMove); // 마우스 이동 이벤트 리스너 추가
    window.addEventListener("pointerdown", onMouseDown); // 마우스 클릭 이벤트 리스너 추가
    window.addEventListener("pointerup", onMouseUp); // 마우스 버튼 릴리스 이벤트 리스너 추가

    render(); // 초기 렌더링 시작

    return () => {
      // 컴포넌트 언마운트 시 실행되는 클린업 함수
      window.removeEventListener("pointermove", onMouseMove); // 마우스 이동 이벤트 리스너 제거
      window.removeEventListener("pointerdown", onMouseDown); // 마우스 클릭 이벤트 리스너 제거
      window.removeEventListener("pointerup", onMouseUp); // 마우스 버튼 릴리스 이벤트 리스너 제거
      renderer.dispose(); // 렌더러 리소스 정리
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement); // DOM에서 렌더러의 요소 제거
      }
    };
  }, []); // 빈 배열을 의존성으로 지정하여 컴포넌트가 마운트될 때만 실행

  return <div ref={containerRef} className="three-container" />; // 렌더링할 DOM 요소 반환
};

export default Raycaster; // Raycaster 컴포넌트 내보냄
