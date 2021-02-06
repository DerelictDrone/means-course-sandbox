import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Post } from './post.model';
import { NodeServer, NodePort } from 'connection_config';

@Injectable({providedIn: 'root'})
export class PostsService {
 private posts: Post[] = [];
 private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http.get<{message: string, posts: Post[]}>(NodeServer + ":" + NodePort + "/api/posts")
      .subscribe((postData:any) => {
        this.posts = postData.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }


  addPost(title: string, content: string) {
    const post: Post= { id: "null", title: title, content: content};
    this.http.post<{message: string}>(NodeServer + ":" + NodePort + "/api/posts", post)
      .subscribe((responseData) => {
        console.log(responseData.message)
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      })
  }
}