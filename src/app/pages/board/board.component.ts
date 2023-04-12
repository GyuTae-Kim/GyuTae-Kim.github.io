import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  posts: string[] = [];

  constructor(private blogService: BlogService) { }

  ngOnInit(): void {
    this.blogService.getPosts().subscribe((posts) => {
      this.posts = posts;
    });
  }
}