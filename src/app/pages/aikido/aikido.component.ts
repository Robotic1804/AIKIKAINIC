import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-aikido',
  standalone: true,
  templateUrl: './aikido.component.html',
  styleUrls: ['./aikido.component.css'],
})
export class AikidoComponent implements OnInit {
  quizAnswers: Record<number, string> = {};
  currentQuestion = 1;
  showQuizResult = false;

  resultData = {
    class: '',
    schedule: '',
    description: '',
  };

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  selectAnswer(questionNum: number, answer: string): void {
    this.quizAnswers[questionNum] = answer;

    if (questionNum < 3) {
      this.currentQuestion = questionNum + 1;
    } else {
      this.showResult();
    }
  }

  showResult(): void {
    this.showQuizResult = true;

    const goal = this.quizAnswers[1];
    const experience = this.quizAnswers[2];
    const time = this.quizAnswers[3];

    if (experience === 'ninguna') {
      this.resultData = {
        class: 'Aikido Principiantes',
        schedule: 'Lunes y Miércoles, 7:00 PM - 8:30 PM',
        description:
          'Perfecta para comenzar desde cero. Aprenderás los fundamentos del Aikido en un ambiente acogedor y sin presión.',
      };
    } else if (experience === 'aikido') {
      this.resultData = {
        class: 'Aikido Avanzado',
        schedule: 'Martes y Jueves, 8:00 PM - 9:30 PM',
        description:
          'Para practicantes con experiencia previa. Profundiza tu técnica y prepárate para exámenes de grado superiores.',
      };
    } else {
      this.resultData = {
        class: 'Aikido Intermedio',
        schedule: 'Lunes, Miércoles y Viernes, 6:00 PM - 7:30 PM',
        description:
          'Ideal si tienes experiencia en otras artes marciales. Combina fundamentos con técnicas más avanzadas.',
      };
    }

    if (goal === 'fitness') {
      this.resultData = {
        class: 'Aikido Fitness & Flexibilidad',
        schedule: 'Sábados, 10:00 AM - 11:30 AM',
        description:
          'Clase enfocada en el aspecto físico del Aikido. Mejora tu flexibilidad, fuerza y resistencia.',
      };
    }

    if (time === '5+') {
      this.resultData.description +=
        ' ¡Con tu disponibilidad, podrías progresar muy rápidamente!';
    }
  }

  resetQuiz(): void {
    this.quizAnswers = {};
    this.currentQuestion = 1;
    this.showQuizResult = false;
  }
}
