import { Component } from '@angular/core';
import { RESEARCH_WORKS } from '../../research-data';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
  works = RESEARCH_WORKS;
}
