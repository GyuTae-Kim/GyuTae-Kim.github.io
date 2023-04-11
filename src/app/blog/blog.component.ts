import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 100;
  totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

  onNextPage() {
    this.currentPage += 1;
  }

  onPreviousPage() {
    this.currentPage -= 1;
  }
}