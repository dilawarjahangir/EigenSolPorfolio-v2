import Image from "next/image";
import styles from "./CreativeTeamSection.module.css";

const teamRows = [
  [
    {
      id: 1,
      name: "Andrew",
      position: "Developer",
      image: "/agntix-home/team/team-1.jpg",
      width: 340,
      height: 470,
      thumbClass: "",
      wrapClass: styles.leftWrap,
    },
    {
      id: 2,
      name: "Sophia",
      position: "Developer",
      image: "/agntix-home/team/team-2.jpg",
      width: 340,
      height: 470,
      thumbClass: "",
      wrapClass: styles.rightWrap,
    },
  ],
  [
    {
      id: 3,
      name: "Emma",
      position: "Developer",
      image: "/agntix-home/team/team-3.jpg",
      width: 340,
      height: 470,
      thumbClass: styles.thumbTwo,
      wrapClass: styles.leftWrap,
    },
    {
      id: 4,
      name: "James",
      position: "Developer",
      image: "/agntix-home/team/team-4.jpg",
      width: 340,
      height: 470,
      thumbClass: styles.thumbFour,
      wrapClass: styles.rightWrap,
    },
  ],
  [
    {
      id: 5,
      name: "Oliver",
      position: "Developer",
      image: "/agntix-home/team/team-5.jpg",
      width: 340,
      height: 440,
      thumbClass: "",
      wrapClass: styles.leftWrap,
    },
    {
      id: 6,
      name: "Charlotte",
      position: "Developer",
      image: "/agntix-home/team/team-6.jpg",
      width: 340,
      height: 440,
      thumbClass: "",
      wrapClass: styles.rightWrap,
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
            <div className={styles.row} key={`team-row-${rowIndex}`}>
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
                        <h3>{member.name}</h3>
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
