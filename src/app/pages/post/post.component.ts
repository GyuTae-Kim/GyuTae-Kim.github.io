import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  postContent = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) { }

  ngOnInit(): void {
    const postName = this.route.snapshot.paramMap.get('post');

    if (postName) {
      this.blogService.getPost(postName).subscribe((postContent) => {
        this.postContent = postContent;
      });
    } else {
      // postName이 null일 때 홈페이지로 리다이렉트
      this.router.navigate(['/']);
    }
  }
}