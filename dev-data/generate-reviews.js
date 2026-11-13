const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Users definition (Adel and Sarah Connor exist in DB; other 5 will be created if not present)
const users = [
  {
    _id: new mongoose.Types.ObjectId('6ade7f11ffce96cc1d3cc14e'),
    name: 'Adel',
    email: 'adelashrafmuhammed@gmail.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d4'),
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d5'),
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d6'),
    name: 'Marcus Brody',
    email: 'marcus.brody@example.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d7'),
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d8'),
    name: 'David Kim',
    email: 'david.kim@example.com',
  },
  {
    _id: new mongoose.Types.ObjectId('6ae73bccd6c6032fd5d842d9'),
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@example.com',
  },
];

// Curated reviews for notable titles
const specificReviews = {
  // Inception
  27205: [
    {
      userIndex: 0,
      rating: 10,
      content:
        'A masterclass in original conceptual filmmaking. Christopher Nolan balances intricate exposition with relentless emotional momentum. The rotating hallway fight scene and Hans Zimmer\'s "Time" remain unmatched in modern cinema.',
      containsSpoilers: false,
      replies: [
        {
          userIndex: 2,
          content:
            'Completely agree, Adel! Even on the fifth rewatch you notice new visual details and rhythmic edits that tie the dreams together.',
        },
      ],
    },
    {
      userIndex: 1,
      rating: 9,
      content:
        'Brilliant pacing and concept. The ambiguous spinning totem ending still sparks lively debate among cinephiles. Leonardo DiCaprio delivers a grounded, desperate emotional anchor that keeps the high-concept premise human.',
      containsSpoilers: true,
    },
  ],
  // The Matrix
  603: [
    {
      userIndex: 3,
      rating: 10,
      content:
        'The Matrix redefined sci-fi cinema at the turn of the millennium. The bullet-time visual effects, cyberpunk philosophy, and martial arts choreography created an aesthetic that countless films tried to copy.',
      containsSpoilers: false,
      replies: [
        {
          userIndex: 4,
          content:
            'The lobby shootout scene alone influenced action filmmaking for the entire next decade. Absolute timeless classic.',
        },
      ],
    },
    {
      userIndex: 0,
      rating: 9,
      content:
        'Neo choosing between the red pill and blue pill is one of the most iconic philosophical dilemmas in modern pop culture. Keanu Reeves and Laurence Fishburne have unbeatable screen presence.',
      containsSpoilers: false,
    },
  ],
  // The Dark Knight
  155: [
    {
      userIndex: 1,
      rating: 10,
      content:
        "Heath Ledger's Joker is quite simply the pinnacle of cinematic villainy. Nolan turned a superhero movie into a gritty, neo-noir crime thriller echoing Michael Mann's Heat.",
      containsSpoilers: false,
      replies: [
        {
          userIndex: 5,
          content:
            'The hospital explosion and interrogation scenes are legendary. Nothing has touched this standard in the genre since.',
        },
      ],
    },
    {
      userIndex: 6,
      rating: 9,
      content:
        "Christian Bale's internal conflict and Gary Oldman's Jim Gordon hold the moral weight of Gotham together. A breathless, tragic, and utterly captivating movie.",
      containsSpoilers: false,
    },
  ],
  // Interstellar
  157336: [
    {
      userIndex: 2,
      rating: 10,
      content:
        "An overwhelming emotional journey anchored by Kip Thorne's theoretical physics and Hoyte van Hoytema's IMAX cinematography. The docking scene with Hans Zimmer's \"No Time for Caution\" gives me chills every time.",
      containsSpoilers: false,
      replies: [
        {
          userIndex: 0,
          content:
            "The video messages scene when Cooper realizes he missed decades of his children's lives is pure cinematic heartbreak. McConaughey's finest performance.",
        },
      ],
    },
    {
      userIndex: 4,
      rating: 9,
      content:
        'A sci-fi spectacle that dares to put unconditional human connection and paternal love at the center of astrophysics. Visually staggering from start to finish.',
      containsSpoilers: true,
    },
  ],
  // Pulp Fiction
  680: [
    {
      userIndex: 5,
      rating: 10,
      content:
        "Tarantino's nonlinear narrative, razor-sharp dialogue, and iconic needle-drops transformed American independent film forever. Samuel L. Jackson and John Travolta have legendary chemistry.",
      containsSpoilers: false,
    },
    {
      userIndex: 3,
      rating: 9,
      content:
        'From the diner stick-up to the diner standoff at the end, every single vignette crackles with tension and dark wit. A cinematic landmark.',
      containsSpoilers: false,
    },
  ],
  // Fight Club
  550: [
    {
      userIndex: 0,
      rating: 9,
      content:
        "David Fincher's cynical exploration of consumerist emptiness and toxic masculinity. The revelation that Tyler Durden and the Narrator are the same psyche is one of the greatest plot twists of all time.",
      containsSpoilers: true,
      replies: [
        {
          userIndex: 1,
          content:
            'The Dust Brothers soundtrack combined with the tactile editing makes this film feel as electric and punchy as its subject matter.',
        },
      ],
    },
  ],
  // Parasite
  496243: [
    {
      userIndex: 4,
      rating: 10,
      content:
        'Bong Joon-ho created an impeccable, darkly comedic architectural thriller about class disparity. The shift in tone during the rainy night sequence is pure directorial wizardry.',
      containsSpoilers: true,
    },
    {
      userIndex: 6,
      rating: 10,
      content:
        'Deserved every single Oscar it won. Every frame, staircase, and dialogue line is meticulously arranged to mirror societal stratification.',
      containsSpoilers: false,
    },
  ],
  // Spirited Away
  129: [
    {
      userIndex: 2,
      rating: 10,
      content:
        "Hayao Miyazaki's crown jewel. Joe Hisaishi's piano score, the lush hand-drawn bathhouse spirits, and Chihiro's coming-of-age journey make this an unforgettable masterpiece of animation.",
      containsSpoilers: false,
    },
  ],
  // Whiplash
  244786: [
    {
      userIndex: 5,
      rating: 10,
      content:
        'Damien Chazelle turns jazz drumming into a high-octane psychological thriller. J.K. Simmons is terrifyingly brilliant as Fletcher, and Miles Teller pours every ounce of sweat onto the kit.',
      containsSpoilers: false,
    },
  ],
  // Breaking Bad (TV)
  1396: [
    {
      userIndex: 0,
      rating: 10,
      content:
        'The greatest television drama ever produced. Walter White\'s transformation from mild-mannered chemistry teacher into ruthless kingpin Heisenberg is executed with peerless narrative discipline. "Ozymandias" is perfection.',
      containsSpoilers: true,
      replies: [
        {
          userIndex: 3,
          content:
            "Vince Gilligan didn't waste a single scene across five seasons. Aaron Paul as Jesse Pinkman is the emotional soul of the entire saga.",
        },
      ],
    },
    {
      userIndex: 1,
      rating: 10,
      content:
        'From the desert cook in the pilot to the tragic resolution in Felina, this show set a bar for character evolution and tension that television will chase forever.',
      containsSpoilers: false,
    },
  ],
  // Game of Thrones (TV)
  1399: [
    {
      userIndex: 3,
      rating: 8,
      content:
        'Seasons 1 through 4 represent the absolute pinnacle of fantasy storytelling, complex political maneuvering, and ensemble acting. Despite a rushed final season, the Red Wedding and Battle of the Bastards remain landmark TV moments.',
      containsSpoilers: true,
    },
  ],
  // Succession (TV)
  76331: [
    {
      userIndex: 6,
      rating: 10,
      content:
        "Shakespearean drama wrapped in sleek Manhattan penthouses and corporate boardrooms. Nicholas Britell's piano score, the razor-sharp satirical writing, and Jeremy Strong's heartbreaking Kendall Roy make this essential viewing.",
      containsSpoilers: false,
      replies: [
        {
          userIndex: 2,
          content:
            'The dialogue delivery and mockumentary camera zooms give every argument excruciating intimacy. A flawless series.',
        },
      ],
    },
  ],
  // Severance (TV)
  95396: [
    {
      userIndex: 4,
      rating: 10,
      content:
        'One of the freshest, most suspenseful sci-fi mysteries in decades. The finale is one of the most nail-biting hours of television ever broadcast. Adam Scott and Patricia Arquette are phenomenal.',
      containsSpoilers: false,
      replies: [
        {
          userIndex: 0,
          content:
            'The waffle party and the OTC activation had my heart pounding through my chest! Cannot wait for season two.',
        },
      ],
    },
  ],
  // Stranger Things (TV)
  66732: [
    {
      userIndex: 1,
      rating: 9,
      content:
        'A nostalgic 80s love letter loaded with synthwave atmosphere, Spielbergian wonder, and Stephen King horror. The Hawkins kids have irresistible chemistry.',
      containsSpoilers: false,
    },
  ],
  // The Last of Us (TV)
  100088: [
    {
      userIndex: 5,
      rating: 9,
      content:
        'Proof that video game adaptations can be elevated art. Pedro Pascal and Bella Ramsey embody Joel and Ellie with profound warmth and grief. Episode 3 with Nick Offerman and Murray Bartlett is unforgettable.',
      containsSpoilers: false,
    },
  ],
};

// Templates for generating reviews for remaining media
const positiveReviewTemplates = [
  (title, type) => ({
    rating: 9,
    content: `A truly phenomenal ${type === 'tv' ? 'series' : 'film'}. From the impeccable art direction to the rich thematic undertones, ${title} commands your attention from the opening frame.`,
    containsSpoilers: false,
  }),
  (title, type) => ({
    rating: 8,
    content: `Captivating storytelling and top-tier acting throughout. ${title} delivers a deeply satisfying ${type === 'tv' ? 'arc' : 'viewing experience'} that rewards thoughtful viewers. Highly recommended.`,
    containsSpoilers: false,
  }),
  (title) => ({
    rating: 10,
    content: `An absolute masterpiece in its genre. The pacing in ${title} is razor-sharp, the cinematography is breathtaking, and the emotional payoff lingers long after the credits roll.`,
    containsSpoilers: false,
  }),
  (title) => ({
    rating: 8,
    content: `What stands out most in ${title} is the authenticity of the characters. Even during quiet moments, the dramatic tension never falters. Essential viewing for film enthusiasts.`,
    containsSpoilers: false,
  }),
  (title, type) => ({
    rating: 7,
    content: `A very solid and entertaining ${type === 'tv' ? 'show' : 'watch'}. Strong ensemble performances and great score keep ${title} consistently engaging despite a slightly uneven second act.`,
    containsSpoilers: false,
  }),
  (title, type) => ({
    rating: 9,
    content: `One of the most impressive ${type === 'tv' ? 'productions' : 'screenplays'} in recent memory. ${title} balances ambitious visual craft with deep character humanity.`,
    containsSpoilers: false,
  }),
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSubset(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function buildReactions(excludeUserId) {
  const eligibleUsers = users
    .filter((u) => !u._id.equals(excludeUserId))
    .map((u) => u._id);

  const reactions = {
    like: [],
    dislike: [],
    love: [],
    funny: [],
    surprised: [],
  };

  const reactionCount = getRandomInt(1, 4);
  const reactedUsers = getRandomSubset(eligibleUsers, reactionCount);

  reactedUsers.forEach((uId) => {
    // 70% like, 20% love, 5% funny, 5% surprised
    const rand = Math.random();
    let type = 'like';
    if (rand > 0.95) type = 'dislike';
    else if (rand > 0.75) type = 'love';
    else if (rand > 0.65) type = 'funny';
    else if (rand > 0.55) type = 'surprised';

    reactions[type].push(uId);
  });

  return reactions;
}

function generateAllReviews() {
  const mediaSummaryPath = path.join(__dirname, 'media-summary.json');
  const mediaList = JSON.parse(fs.readFileSync(mediaSummaryPath, 'utf-8'));

  const allReviews = [];

  mediaList.forEach((media) => {
    const { tmdbId, mediaType, title } = media;

    // Check if we have specific hand-crafted reviews
    if (specificReviews[tmdbId]) {
      const specs = specificReviews[tmdbId];
      specs.forEach((item) => {
        const topReviewId = new mongoose.Types.ObjectId();
        const author = users[item.userIndex];

        allReviews.push({
          _id: topReviewId,
          mediaId: tmdbId,
          mediaType: mediaType,
          user: author._id,
          rating: item.rating,
          content: item.content,
          containsSpoilers: item.containsSpoilers || false,
          parentCommentId: null,
          reactions: buildReactions(author._id),
          isReported: false,
          reportCount: 0,
        });

        // Add replies if any
        if (item.replies && item.replies.length > 0) {
          item.replies.forEach((rep) => {
            const replyAuthor = users[rep.userIndex];
            allReviews.push({
              _id: new mongoose.Types.ObjectId(),
              mediaId: tmdbId,
              mediaType: mediaType,
              user: replyAuthor._id,
              content: rep.content,
              containsSpoilers: false,
              parentCommentId: topReviewId,
              reactions: buildReactions(replyAuthor._id),
              isReported: false,
              reportCount: 0,
            });
          });
        }
      });
    } else {
      // Generate 1 to 2 realistic reviews using diverse users
      const reviewCount = getRandomInt(1, 2);
      const chosenUserIndices = getRandomSubset(
        [0, 1, 2, 3, 4, 5, 6],
        reviewCount,
      );

      chosenUserIndices.forEach((uIdx, idx) => {
        const author = users[uIdx];
        const templateFn =
          positiveReviewTemplates[
            (tmdbId + idx) % positiveReviewTemplates.length
          ];
        const reviewData = templateFn(title, mediaType);

        allReviews.push({
          _id: new mongoose.Types.ObjectId(),
          mediaId: tmdbId,
          mediaType: mediaType,
          user: author._id,
          rating: reviewData.rating,
          content: reviewData.content,
          containsSpoilers: reviewData.containsSpoilers,
          parentCommentId: null,
          reactions: buildReactions(author._id),
          isReported: false,
          reportCount: 0,
        });
      });
    }
  });

  const outputPath = path.join(__dirname, 'data', 'reviews-seed.json');
  fs.writeFileSync(outputPath, JSON.stringify(allReviews, null, 2));

  console.log(
    `Generated ${allReviews.length} reviews for ${mediaList.length} media items.`,
  );
  console.log(`Saved to ${outputPath}`);
}

generateAllReviews();
