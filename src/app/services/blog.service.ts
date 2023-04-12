import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private postsUrl = '/assets/posts';

  constructor(private http: HttpClient) { }

  getPosts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.postsUrl}/posts.json`);
  }

  getPost(postName: string): Observable<string> {
    return this.http.get(`${this.postsUrl}/${postName}`, { responseType: 'text' });
  }
}