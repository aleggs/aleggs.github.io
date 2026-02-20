export interface Photo {
  id: string;
  url: string;
  name: string;
}

export interface Score {
  wins: number;
  losses: number;
  played: number;
  opponents: string[];
}

export interface Match {
  pA: Photo;
  pB: Photo;
}

export class TournamentEngine {
  photos: Photo[] = [];
  scores: Record<string, Score> = {};
  currentSwissRound = 0;
  swissRoundsTotal = 0;
  isPlayoffMode = false;
  playoffMatches: Photo[][] = [];
  playoffWinners: Photo[] = [];

  constructor(photos: Photo[]) {
    this.photos = [...photos];
    this.photos.forEach((p) => {
      this.scores[p.id] = { wins: 0, losses: 0, played: 0, opponents: [] };
    });
    this.swissRoundsTotal = Math.ceil(Math.log2(this.photos.length));
  }

  generateSwissRound(): Match[] {
    const sorted = [...this.photos].sort(
      (a, b) => this.scores[b.id].wins - this.scores[a.id].wins || Math.random() - 0.5
    );
    const matches: Match[] = [];
    const paired = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      if (paired.has(sorted[i].id)) continue;

      let foundOpponent = false;
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          !paired.has(sorted[j].id) &&
          !this.scores[sorted[i].id].opponents.includes(sorted[j].id)
        ) {
          matches.push({ pA: sorted[i], pB: sorted[j] });
          paired.add(sorted[i].id);
          paired.add(sorted[j].id);
          foundOpponent = true;
          break;
        }
      }

      if (!foundOpponent) {
        // Fallback: pair with anyone not paired
        for (let j = i + 1; j < sorted.length; j++) {
          if (!paired.has(sorted[j].id)) {
            matches.push({ pA: sorted[i], pB: sorted[j] });
            paired.add(sorted[i].id);
            paired.add(sorted[j].id);
            foundOpponent = true;
            break;
          }
        }
      }

      if (!foundOpponent) {
        // Bye
        this.scores[sorted[i].id].wins++;
        this.scores[sorted[i].id].played++;
        paired.add(sorted[i].id);
      }
    }
    return matches;
  }

  recordResult(winner: Photo, loser: Photo) {
    this.scores[winner.id].wins++;
    this.scores[loser.id].losses++;
    this.scores[winner.id].played++;
    this.scores[loser.id].played++;
    this.scores[winner.id].opponents.push(loser.id);
    this.scores[loser.id].opponents.push(winner.id);
  }

  getTopPhotos(count: number): Photo[] {
    return [...this.photos].sort(
      (a, b) => this.scores[b.id].wins - this.scores[a.id].wins
    ).slice(0, count);
  }

  getRankedPhotos(): Photo[] {
    return [...this.photos].sort(
      (a, b) => this.scores[b.id].wins - this.scores[a.id].wins
    );
  }
}
