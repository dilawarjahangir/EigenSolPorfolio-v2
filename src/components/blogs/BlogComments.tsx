import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./BlogPages.module.css";

const comments = [
  {
    author: "Farhan Firoz",
    date: "July 17, 2026",
    avatar: "/agntix-blog/blog-details-sm-2.jpg",
    text: "The focus on measurable outcomes is useful. It gives teams a practical way to discuss architecture without turning the conversation into a list of tools.",
    child: false,
  },
  {
    author: "Harun Rashid",
    date: "July 18, 2026",
    avatar: "/agntix-blog/blog-details-sm-1.jpg",
    text: "Making operational constraints visible early has saved our team a lot of rework. The same principle applies to product scope and design systems.",
    child: true,
  },
  {
    author: "James Taylor",
    date: "July 19, 2026",
    avatar: "/agntix-blog/blog-details-sm-2.jpg",
    text: "A strong reminder that reliable delivery depends as much on feedback loops and ownership as it does on the implementation itself.",
    child: false,
  },
];

export default function BlogComments() {
  return (
    <ul className={styles.commentsList}>
      {comments.map((comment) => (
        <li className={comment.child ? styles.childComment : ""} key={comment.author}>
          <article className={styles.comment}>
            <Image src={comment.avatar} alt="" width={76} height={76} />
            <div className={styles.commentBody}>
              <div className={styles.commentMeta}>
                <h3>By {comment.author}</h3>
                <time>{comment.date}</time>
              </div>
              <p>{comment.text}</p>
              <a href="#reply-form">
                Reply
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
