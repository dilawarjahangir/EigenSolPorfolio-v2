import Image from "next/image";
import styles from "./CreativeTeamSection.module.css";

const teamRows = [
  [
    {
      id: 1,
      name: "Abdullah Ahmad",
      position: "Founder & Software Engineer",
      image: "/team/abdullahPhoto.webp",
      width: 340,
      height: 470,
      thumbClass: "",
      wrapClass: styles.leftWrap,
      longName: false,
    },
    {
      id: 2,
      name: "Muhammad Umer",
      position: "Co-Founder & Marketing Expert",
      image: "/team/umernew.webp",
      width: 340,
      height: 470,
      thumbClass: "",
      wrapClass: styles.rightWrap,
      longName: false,
    },
  ],
  [
    {
      id: 3,
      name: "Dilawar Jahangir",
      position: "Co-Founder & Full Stack Developer",
      image: "/team/dilawarPhoto.webp",
      width: 340,
      height: 470,
      thumbClass: styles.thumbTwo,
      wrapClass: styles.leftWrap,
      longName: false,
    },
    {
      id: 4,
      name: "Muhammad Saim",
      position: "Co-Founder, AI Engineer & Researcher",
      image: "/team/saimPhoto.webp",
      width: 340,
      height: 470,
      thumbClass: styles.thumbFour,
      wrapClass: styles.rightWrap,
      longName: false,
    },
  ],
  [
    {
      id: 5,
      name: "Abdullah Faisal",
      position: "AI Engineer",
      image: "/team/abdullahFaisalPhoto.webp",
      width: 340,
      height: 440,
      thumbClass: "",
      wrapClass: styles.leftWrap,
      longName: false,
    },
    {
      id: 6,
      name: "Syed Abdul Muhaymin",
      position: "Full-Stack JavaScript Engineer",
      image: "/team/muhayminPhoto.webp",
      width: 340,
      height: 440,
      thumbClass: "",
      wrapClass: styles.rightWrap,
      longName: true,
    },
  ],
  [
    {
      id: 7,
      name: "Manan Qasim",
      position: "Financial Accountant",
      image: "/team/mannanPhoto.webp",
      width: 340,
      height: 440,
      thumbClass: "",
      wrapClass: styles.centerWrap,
      longName: false,
    },
  ],
] as const;

export default function CreativeTeamSection() {
  return (
    <section className={`${styles.area} studio-team-area`} aria-labelledby="team-heading">
      <div className={styles.container}>
        <div className={`${styles.row} ${styles.headingRow}`}>
          <div className={`${styles.column} ${styles.headingColumn}`}>
            <div className={`${styles.titleBox} studio-team-title-box`}>
              <h2 id="team-heading" className={styles.title}>
                <span className={styles.titleLine}>
                  <span className={styles.firstTitleWord}>Our</span>
                  <span className={styles.titleWordSpace}> </span>
                  <span className={styles.secondTitleWord}>Team</span>
                </span>
                <br className={styles.titleBreak} />
                <span className={styles.memberTitleLine}>Member</span>
              </h2>
              <p>
                Our ability to combine expertise and systems <br />
                thinking is what fuels us as a team.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.teamWrap}>
          {teamRows.map((row, rowIndex) => (
            <div
              className={`${styles.row} ${row.length === 1 ? styles.singleRow : ""}`}
              key={`team-row-${rowIndex}`}
            >
              {row.map((member) => (
                <div className={`${styles.column} ${styles.teamColumn}`} key={member.id}>
                  <div className={`${styles.thumbWrap} ${member.wrapClass}`}>
                    <div className={`${styles.thumb} ${member.thumbClass}`}>
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={member.width}
                        height={member.height}
                        loading="eager"
                        unoptimized
                        sizes="(max-width: 767px) calc(100vw - 30px), 340px"
                      />
                      <div className={styles.memberContent}>
                        <h3 className={member.longName ? styles.longName : ""}>{member.name}</h3>
                        <span>{member.position}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
