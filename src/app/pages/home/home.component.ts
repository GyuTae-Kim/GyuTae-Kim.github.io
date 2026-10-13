import { Component } from '@angular/core';
import { CASE_STUDIES } from '../../portfolio-data';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  cases = CASE_STUDIES;
  stage = 1;
  stages = [
    {
      label: '01 · CAD 형상',
      title: '형상을 읽는 것에서 시작합니다.',
      text: '면·삼각면의 기하와 인접 관계를 그래프로 구성합니다. 별도의 판재 분류 연구에서는 판재·면·접촉 관계를 표현합니다.',
    },
    {
      label: '02 · 특징 인식',
      title: '형상에 제조의 의미를 부여합니다.',
      text: '가공 특징 인식의 면 예측을 포켓·구멍·필렛 그룹으로 연결합니다. 라벨과 기하 입력의 일치부터 확인합니다.',
    },
    {
      label: '03 · CAM 연결',
      title: '예측을 가공 가능한 작업으로 연결합니다.',
      text: '인식 결과를 가공 계획으로 전달하고, Fusion에서 셋업·공구 경로·시뮬레이션을 확인합니다.',
    },
  ];
}
