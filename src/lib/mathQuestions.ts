function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type MathQ = {
  prompt: string;
  answers: string[];
  correct: number;
};

export function getRandomMathQuestion(difficulty: "easy" | "medium" | "hard"): MathQ {
  let a: number, b: number, op: string, solution: number;
  let prompt = "";
  
  switch (difficulty) {
    case "easy":
      a = getRandomInt(1, 10);
      b = getRandomInt(1, 10);
      op = Math.random() > 0.5 ? "+" : "-";
      if (op === "-") {
        if (a < b) {
          [a, b] = [b, a];
        }
        solution = a - b;
        prompt = `${a} - ${b} = ?`;
      } else {
        solution = a + b;
        prompt = `${a} + ${b} = ?`;
      }
      break;
    case "medium":
      a = getRandomInt(2, 12);
      b = getRandomInt(2, 12);
      op = Math.random() > 0.5 ? "×" : "÷";
      if (op === "×") {
        solution = a * b;
        prompt = `${a} × ${b} = ?`;
      } else {
        solution = a;
        const d = b;
        a = a * d;
        prompt = `${a} ÷ ${d} = ?`;
        b = d;
      }
      break;
    case "hard":
      let type = getRandomInt(1, 2);
      if (type === 1) {
        a = getRandomInt(10, 50);
        b = getRandomInt(1, 10);
        let c = getRandomInt(1, 20);
        op = Math.random() > 0.5 ? "+" : "-";
        solution = op === "+" ? a + b * c : a - b * c;
        prompt = `${a} ${op} (${b} × ${c}) = ?`;
      } else {
        let d = getRandomInt(2, 10);
        let n = getRandomInt(1, d - 1);
        solution = Number((n / d).toFixed(2));
        prompt = `${n} ÷ ${d} = ? (rounded to 2 decimals)`;
      }
      break;
    default:
      a = getRandomInt(1, 10);
      b = getRandomInt(1, 10);
      op = "+";
      solution = a + b;
      prompt = `${a} + ${b} = ?`;
  }
  
  let answers: (number | string)[] = [solution];
  while (answers.length < 4) {
    let distractor;
    if (typeof solution === "number") {
      let delta = getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
      distractor = (typeof solution === "number" ? Number((solution + delta).toFixed(2)) : solution + delta);
    } else {
      distractor = solution + getRandomInt(1, 4);
    }
    if (!answers.includes(distractor)) answers.push(distractor);
  }
  
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  const correct = answers.findIndex(a => String(a) === String(solution));
  
  return {
    prompt,
    answers: answers.map(String),
    correct,
  };
}