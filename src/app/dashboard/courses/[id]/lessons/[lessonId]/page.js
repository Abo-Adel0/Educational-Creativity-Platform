"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import ProtectedRoute from "../../../../../../components/ProtectedRoute";
import Toast from "../../../../../../components/Toast";

const getItemTypeName = (type) => {
  if (type === "video") return "فيديو";
  if (type === "pdf") return "ملف PDF";
  if (type === "exam") return "امتحان";
  return "عنصر";
};

const getItemIcon = (type) => {
  if (type === "video") return "🎥";
  if (type === "pdf") return "📄";
  if (type === "exam") return "📝";
  return "📌";
};

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id;
  const lessonId = params.lessonId;

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [items, setItems] = useState([]);

  const [itemType, setItemType] = useState("video");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [passScore, setPassScore] = useState("50");

  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questionMark, setQuestionMark] = useState("1");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lessonFound, setLessonFound] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/lessons/${lessonId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        setLessonFound(false);
        showToast(data.message || "المحاضرة غير موجودة", "error");
        return;
      }

      setLessonTitle(data.lesson.title || "");
      setLessonDescription(data.lesson.description || "");

      const loadedItems = (data.lesson.items || []).map((item) => ({
        id: item._id || item.id || `${Date.now()}-${Math.random()}`,
        _id: item._id,
        type: item.type,
        title: item.title || "",
        description: item.description || "",
        url: item.url || "",
        order: item.order || 1,
        videoProvider: item.videoProvider || "",
        cloudflareVideoId: item.cloudflareVideoId || "",
        passScore: item.passScore || 50,
        questions: item.questions || [],
      }));

      setItems(loadedItems);
      setLessonFound(true);
    } catch (error) {
      setLessonFound(false);
      showToast("حدث خطأ أثناء تحميل المحاضرة", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const resetQuestionForm = () => {
    setQuestionText("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setCorrectIndex(0);
    setQuestionMark("1");
  };

  const resetItemForm = () => {
    setItemType("video");
    setItemTitle("");
    setItemDescription("");
    setItemUrl("");
    setPassScore("50");
    setQuestions([]);
    resetQuestionForm();
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      showToast("اكتب نص السؤال", "error");
      return;
    }

    const options = [
      option1.trim(),
      option2.trim(),
      option3.trim(),
      option4.trim(),
    ].filter(Boolean);

    if (options.length < 2) {
      showToast("لازم تضيف اختيارين على الأقل", "error");
      return;
    }

    if (correctIndex >= options.length) {
      showToast("الإجابة الصحيحة غير موجودة ضمن الاختيارات", "error");
      return;
    }

    const newQuestion = {
      id: `${Date.now()}-${Math.random()}`,
      text: questionText.trim(),
      options,
      correctIndex: Number(correctIndex),
      mark: Number(questionMark) || 1,
    };

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();

    showToast("تم إضافة السؤال", "success");
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(
      questions.filter((question) => (question._id || question.id) !== id)
    );

    showToast("تم حذف السؤال", "success");
  };

  const handleAddItem = () => {
    if (!itemTitle.trim()) {
      showToast("أدخل عنوان العنصر", "error");
      return;
    }

    if (
      (itemType === "video" || itemType === "pdf") &&
      !itemUrl.trim()
    ) {
      showToast("أدخل الرابط", "error");
      return;
    }

    if (itemType === "exam" && questions.length === 0) {
      showToast("أضف سؤال واحد على الأقل للامتحان", "error");
      return;
    }

    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      type: itemType,
      title: itemTitle.trim(),
      description: itemDescription.trim(),
      url: itemType === "exam" ? "" : itemUrl.trim(),
      passScore: itemType === "exam" ? Number(passScore) || 50 : 0,
      questions: itemType === "exam" ? questions : [],
      order: items.length + 1,
    };

    setItems([...items, newItem]);
    resetItemForm();

    showToast("تم إضافة العنصر", "success");
  };

  const handleDeleteItem = (id) => {
    const updatedItems = items
      .filter((item) => (item._id || item.id) !== id)
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));

    setItems(updatedItems);
    showToast("تم حذف العنصر", "success");
  };

  const moveItem = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) {
      return;
    }

    const updatedItems = [...items];

    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[newIndex];
    updatedItems[newIndex] = temp;

    const reordered = updatedItems.map((item, itemIndex) => ({
      ...item,
      order: itemIndex + 1,
    }));

    setItems(reordered);
  };

  const stats = useMemo(() => {
    return {
      videos: items.filter((item) => item.type === "video").length,
      files: items.filter((item) => item.type === "pdf").length,
      exams: items.filter((item) => item.type === "exam").length,
    };
  }, [items]);

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) {
      showToast("أدخل عنوان المحاضرة", "error");
      return;
    }

    if (items.length === 0) {
      showToast("المحاضرة لازم تحتوي على عنصر واحد على الأقل", "error");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: lessonTitle,
          description: lessonDescription,
          items,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل حفظ المحاضرة", "error");
        return;
      }

      showToast("تم حفظ المحاضرة بنجاح", "success");

      setTimeout(() => {
        router.push(`/dashboard/courses/${courseId}`);
      }, 1200);
    } catch (error) {
      showToast("حدث خطأ أثناء حفظ المحاضرة", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8">
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        />

        <section className="min-h-screen flex items-center justify-center">
          <div className="container-custom">
            <div className="glass-card p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 text-center md:text-right">
                <div>
                  <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">
                    تعديل المحاضرة
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2] max-w-3xl">
                    عدّل بيانات المحاضرة أو أضف عناصر جديدة، ولو العنصر امتحان تقدر تضيف أسئلة واختيارات وإجابة صحيحة.
                  </p>
                </div>

                <Link
                  href={`/dashboard/courses/${courseId}`}
                  className="primary-btn whitespace-nowrap"
                >
                  الرجوع للكورس
                </Link>
              </div>

              {loading ? (
                <div className="glass-card p-10 text-center">
                  <h2 className="text-2xl main-title">
                    جاري تحميل المحاضرة...
                  </h2>
                </div>
              ) : !lessonFound ? (
                <div className="glass-card p-10 text-center">
                  <img
                    src="/images/empty.png"
                    alt="empty"
                    className="w-[170px] mx-auto mb-6"
                  />

                  <h2 className="text-2xl main-title mb-4">
                    المحاضرة غير موجودة
                  </h2>

                  <Link
                    href={`/dashboard/courses/${courseId}`}
                    className="primary-btn inline-block"
                  >
                    الرجوع للكورس
                  </Link>
                </div>
              ) : (
                <>
                  <div className="glass-card p-6 md:p-8 mb-10">
                    <h2 className="text-2xl md:text-3xl main-title mb-6">
                      بيانات المحاضرة
                    </h2>

                    <div className="grid grid-cols-1 gap-5">
                      <input
                        type="text"
                        placeholder="عنوان المحاضرة"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                      />

                      <textarea
                        placeholder="وصف المحاضرة"
                        value={lessonDescription}
                        onChange={(e) => setLessonDescription(e.target.value)}
                        className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[130px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="glass-card p-6 md:p-8 mb-10">
                    <h2 className="text-2xl md:text-3xl main-title mb-6">
                      إضافة عنصر جديد
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <select
                        value={itemType}
                        onChange={(e) => {
                          setItemType(e.target.value);
                          setItemUrl("");
                          setQuestions([]);
                          resetQuestionForm();
                        }}
                        className="w-full glass-card p-4 bg-[var(--bg-secondary)] outline-none text-[var(--text-primary)]"
                      >
                        <option value="video">فيديو</option>
                        <option value="pdf">ملف PDF</option>
                        <option value="exam">امتحان</option>
                      </select>

                      <input
                        type="text"
                        placeholder={`عنوان ${getItemTypeName(itemType)}`}
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                      />

                      {(itemType === "video" || itemType === "pdf") && (
                        <input
                          type="text"
                          placeholder={
                            itemType === "video"
                              ? "رابط الفيديو"
                              : "رابط ملف PDF"
                          }
                          value={itemUrl}
                          onChange={(e) => setItemUrl(e.target.value)}
                          className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] md:col-span-2"
                        />
                      )}

                      {itemType === "exam" && (
                        <input
                          type="number"
                          placeholder="درجة النجاح من 100"
                          value={passScore}
                          onChange={(e) => setPassScore(e.target.value)}
                          className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] md:col-span-2"
                        />
                      )}

                      <textarea
                        placeholder={`وصف ${getItemTypeName(itemType)}`}
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[120px] md:col-span-2 resize-none"
                      />
                    </div>

                    {itemType === "exam" && (
                      <div className="glass-card p-6 md:p-8 mt-8">
                        <h3 className="text-2xl md:text-3xl main-title mb-6">
                          أسئلة الامتحان
                        </h3>

                        <div className="grid grid-cols-1 gap-5 mb-8">
                          <textarea
                            placeholder="نص السؤال"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[100px] resize-none"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="الاختيار الأول"
                              value={option1}
                              onChange={(e) => setOption1(e.target.value)}
                              className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                            />

                            <input
                              type="text"
                              placeholder="الاختيار الثاني"
                              value={option2}
                              onChange={(e) => setOption2(e.target.value)}
                              className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                            />

                            <input
                              type="text"
                              placeholder="الاختيار الثالث اختياري"
                              value={option3}
                              onChange={(e) => setOption3(e.target.value)}
                              className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                            />

                            <input
                              type="text"
                              placeholder="الاختيار الرابع اختياري"
                              value={option4}
                              onChange={(e) => setOption4(e.target.value)}
                              className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                              value={correctIndex}
                              onChange={(e) =>
                                setCorrectIndex(Number(e.target.value))
                              }
                              className="w-full glass-card p-4 bg-[var(--bg-secondary)] outline-none text-[var(--text-primary)]"
                            >
                              <option value={0}>الإجابة الصحيحة: الاختيار الأول</option>
                              <option value={1}>الإجابة الصحيحة: الاختيار الثاني</option>
                              <option value={2}>الإجابة الصحيحة: الاختيار الثالث</option>
                              <option value={3}>الإجابة الصحيحة: الاختيار الرابع</option>
                            </select>

                            <input
                              type="number"
                              placeholder="درجة السؤال"
                              value={questionMark}
                              onChange={(e) => setQuestionMark(e.target.value)}
                              className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                            />
                          </div>

                          <button
                            onClick={handleAddQuestion}
                            className="primary-btn"
                          >
                            إضافة السؤال
                          </button>
                        </div>

                        {questions.length === 0 ? (
                          <div className="glass-card p-6 text-center">
                            <p className="text-[var(--text-secondary)]">
                              لم يتم إضافة أسئلة بعد
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {questions.map((question, index) => (
                              <div
                                key={question._id || question.id}
                                className="glass-card p-5"
                              >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <h4 className="text-xl sub-title mb-3">
                                      {index + 1}. {question.text}
                                    </h4>

                                    <p className="text-[var(--text-secondary)] mb-2">
                                      الدرجة: {question.mark}
                                    </p>

                                    <p className="text-[var(--gold-primary)]">
                                      الإجابة الصحيحة:{" "}
                                      {question.options[question.correctIndex]}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleDeleteQuestion(
                                        question._id || question.id
                                      )
                                    }
                                    className="glass-card p-4 text-red-400"
                                  >
                                    حذف السؤال
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleAddItem}
                      className="primary-btn w-full mt-8"
                    >
                      إضافة العنصر
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.videos}
                      </h2>
                      <p className="text-[var(--text-secondary)]">فيديوهات</p>
                    </div>

                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.files}
                      </h2>
                      <p className="text-[var(--text-secondary)]">ملفات PDF</p>
                    </div>

                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.exams}
                      </h2>
                      <p className="text-[var(--text-secondary)]">امتحانات</p>
                    </div>
                  </div>

                  <div className="glass-card p-6 md:p-8 mb-10">
                    <h2 className="text-2xl md:text-3xl main-title mb-6">
                      ترتيب محتوى المحاضرة
                    </h2>

                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <img
                          src="/images/empty.png"
                          alt="empty"
                          className="w-[160px] mx-auto mb-6"
                        />

                        <h3 className="text-2xl main-title">
                          لم يتم إضافة أي عناصر بعد
                        </h3>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {items.map((item, index) => {
                          const itemId = item._id || item.id;

                          return (
                            <div
                              key={itemId || index}
                              className="glass-card p-5"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div>
                                  <p className="text-[var(--gold-primary)] sub-title mb-2">
                                    {index + 1}. {getItemIcon(item.type)}{" "}
                                    {getItemTypeName(item.type)}
                                  </p>

                                  <h3 className="text-2xl main-title mb-2">
                                    {item.title}
                                  </h3>

                                  {item.description && (
                                    <p className="text-[var(--text-secondary)] leading-[2]">
                                      {item.description}
                                    </p>
                                  )}

                                  {item.type === "exam" && (
                                    <p className="text-[var(--text-secondary)] mt-3">
                                      عدد الأسئلة: {item.questions?.length || 0} — درجة النجاح: {item.passScore || 50}
                                    </p>
                                  )}

                                  {item.url && (
                                    <p className="text-[var(--text-secondary)] mt-3 break-all">
                                      الرابط: {item.url}
                                    </p>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-3 min-w-[220px]">
                                  <button
                                    onClick={() => moveItem(index, "up")}
                                    className="glass-card p-3"
                                  >
                                    ↑
                                  </button>

                                  <button
                                    onClick={() => moveItem(index, "down")}
                                    className="glass-card p-3"
                                  >
                                    ↓
                                  </button>

                                  <button
                                    onClick={() => handleDeleteItem(itemId)}
                                    className="glass-card p-3 text-red-400"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-6 md:p-8 text-center">
                    <h2 className="text-2xl md:text-3xl main-title mb-5">
                      حفظ التعديلات
                    </h2>

                    <p className="text-[var(--text-secondary)] leading-[2] mb-7">
                      بعد الحفظ، هتتحدث المحاضرة داخل MongoDB وتظهر للطالب بالترتيب الجديد.
                    </p>

                    <button
                      onClick={handleSaveLesson}
                      disabled={saving}
                      className="primary-btn"
                    >
                      {saving ? "جاري الحفظ..." : "حفظ المحاضرة"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}