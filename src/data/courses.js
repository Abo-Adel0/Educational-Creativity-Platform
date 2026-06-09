const courses = [

  {

    id: 1,

    teacherId: 1,

    title:
      "شرح النحو كامل",

    description:
      "شرح شامل ومفصل لمنهج النحو بطريقة مبسطة وحديثة.",

    grade:
      "الصف الأول الثانوي",

    price: 150,

    image:
      "/images/courses/course1.jpg",

    lessons: [

      {

        id: 1,

        title:
          "المحاضرة الأولى",

        description:
          "شرح أساسيات النحو.",

        video:
          "https://www.w3schools.com/html/mov_bbb.mp4",

        pdf:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",

        exam: {

          passingScore: 50,

          questions: [

            {

              question:
                "ما هو تعريف الكلمة؟",

              options: [

                "لفظ مفيد",

                "لفظ مفرد",

                "اسم فقط",

                "فعل فقط",

              ],

              correctAnswer:
                "لفظ مفرد",

            },

          ],

        },

      },

    ],

  },

];

export default courses;