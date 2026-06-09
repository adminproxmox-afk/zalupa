window.graphlyQuizCatalog = [
  {
    id: 'quiz-block-1',
    title: 'Базові поняття',
    subtitle: 'Графи, вершини, ребра, степінь',
    description: 'Почніть з основ теорії графів і перевірте базові означення.',
    filePath: 'lectures_pages/test_json/test1.json',
    formId: 'quiz-form-1',
    containerId: 'quiz-container-1',
    resultId: 'quiz-result-1',
    duration: 180,
    questionCount: 3,
    accent: 'Лекція 1',
  },
  {
    id: 'quiz-block-2',
    title: 'Подання графів',
    subtitle: 'Матриці, списки, інцидентність',
    description: 'Оберіть цей блок, якщо хочете пройти питання про різні способи представлення.',
    filePath: 'lectures_pages/test_json/test2.json',
    formId: 'quiz-form-2',
    containerId: 'quiz-container-2',
    resultId: 'quiz-result-2',
    duration: 180,
    questionCount: 3,
    accent: 'Лекція 2',
  },
  {
    id: 'quiz-block-3',
    title: 'Операції над графами',
    subtitle: 'Підграфи, об’єднання, дерева',
    description: 'Блок для перевірки операцій над графами та базових алгоритмічних ідей.',
    filePath: 'lectures_pages/test_json/test3.json',
    formId: 'quiz-form-3',
    containerId: 'quiz-container-3',
    resultId: 'quiz-result-3',
    duration: 180,
    questionCount: 3,
    accent: 'Лекція 3',
  },
];

window.testLectureData = {
  'lectures_pages/test_json/test1.json': [
    {
      question: '1. Що таке граф у теорії графів?',
      options: [
        'Множина вершин та ребер',
        'Тільки набір чисел',
        'Будь-яка таблиця',
      ],
      correct: 'a',
    },
    {
      question: '2. Як називається ребро, початок і кінець якого збігаються?',
      options: ['Міст', 'Петля', 'Дуга'],
      correct: 'b',
    },
    {
      question: '3. Що показує степінь вершини?',
      options: [
        'Кількість інцидентних ребер',
        'Номер вершини',
        'Колір вершини',
      ],
      correct: 'a',
    },
  ],
  'lectures_pages/test_json/test2.json': [
    {
      question: '1. Який тип графа має напрямлені ребра?',
      options: [
        'Неорієнтований граф',
        'Орієнтований граф',
        'Простий граф',
      ],
      correct: 'b',
    },
    {
      question: '2. Яке подання графа показує список сусідів кожної вершини?',
      options: [
        'Матриця суміжності',
        'Список ребер',
        'Список суміжності',
      ],
      correct: 'c',
    },
    {
      question: '3. Чому списки суміжності зручні для розріджених графів?',
      options: [
        'Тому що вони займають менше місця',
        'Тому що вони завжди прості',
        'Тому що вони містять ваги ребер',
      ],
      correct: 'a',
    },
  ],
  'lectures_pages/test_json/test3.json': [
    {
      question: '1. Який граф називають деревом?',
      options: [
        'Зв’язний ациклічний граф',
        'Граф без вершин',
        'Будь-який орієнтований граф',
      ],
      correct: 'a',
    },
    {
      question: '2. Що знаходить алгоритм Дейкстри?',
      options: [
        'Найкоротші шляхи від початкової вершини',
        'Усі ізоморфні графи',
        'Лише кількість ребер',
      ],
      correct: 'a',
    },
    {
      question: '3. Яка умова важлива для алгоритму Дейкстри?',
      options: [
        'Ребра не повинні мати від’ємних ваг',
        'Усі вершини повинні мати однаковий колір',
        'Граф має бути порожнім',
      ],
      correct: 'a',
    },
  ],
};
