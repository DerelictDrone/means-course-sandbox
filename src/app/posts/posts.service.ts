import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from './post.model';
import { NodeServer, NodePort, reqprotocol } from 'connection_config';

@Injectable({providedIn: 'root'})
export class PostsService {
 private posts: Post[] = [];
 private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pgsz=${postsPerPage}&pg=${currentPage}`;
    this.http.get<{message: string, posts: any, maxPosts: number}>(
    reqprotocol + "://" + NodeServer + ":" + NodePort + "/api/posts" + queryParams
    )
    .pipe(map((postData) => {
      return {
        posts: postData.posts.map(post => {
        return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          }
        }), maxPosts: postData.maxPosts
      };
    })
  )
    .subscribe(modPostData => {
        console.log(modPostData);
        this.posts = modPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: modPostData.maxPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: any) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>(reqprotocol + "://" + NodeServer + ":" + NodePort + "/api/posts/" + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title)
    postData.append("content", content)
    postData.append("image", image, title)
    this.http.post<{message: string, post: Post }>(reqprotocol + "://" + NodeServer + ":" + NodePort + "/api/posts", postData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      })
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: "null"
      };
    }
  this.http.put(reqprotocol + "://" + NodeServer + ":" + NodePort + "/api/posts/" + id, postData)
  .subscribe(response => {
    this.router.navigate(["/"]);
  })
}

  deletePost(postId: string) {
    return this.http
    .delete(reqprotocol + "://" + NodeServer + ":" + NodePort + "/api/posts/" + postId);
  }
}
