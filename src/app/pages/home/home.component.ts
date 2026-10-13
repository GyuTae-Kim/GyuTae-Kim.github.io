import { Component } from '@angular/core';
import { CASE_STUDIES } from '../../portfolio-data';
import { RESEARCH_WORKS } from '../../research-data';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  cases = CASE_STUDIES;
  research = RESEARCH_WORKS.filter((work) => work.result);
  // Shown as its own card beside the CAD → feature → CAM figure.
  furniture = CASE_STUDIES.find((c) => c.id === 'sketchup-manufacturing')!;
  stage = 1;
  stages = [
    {
      label: '01 · CAD 형상',
      title: '먼저 형상을 읽습니다.',
      text: '면과 삼각면의 기하 정보, 서로 맞닿은 관계를 그래프로 만듭니다. 별도의 판재 분류 연구에서는 판재와 면, 접촉 관계를 함께 표현합니다.',
    },
    {
      label: '02 · 특징 인식',
      title: '면마다 가공 의미를 붙입니다.',
      text: '면 단위 예측을 포켓, 구멍, 필렛 같은 가공 특징 그룹으로 묶습니다. 그 전에 라벨과 기하 입력이 서로 맞는지부터 확인합니다.',
    },
    {
      label: '03 · CAM 연결',
      title: '가공 작업으로 이어 갑니다.',
      text: '인식 결과를 가공 계획에 넘기고, Fusion에서 셋업과 공구 경로, 시뮬레이션을 확인합니다.',
    },
  ];
}
