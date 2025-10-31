// Live E2E test for Supabase Edge Function backend
// Usage: node scripts/live-test.js

(async () => {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { createClient } = await import('@supabase/supabase-js');

    // Read projectId and anon key from src/utils/supabase/info.tsx
    const infoPath = path.resolve('src/utils/supabase/info.tsx');
    const txt = await fs.readFile(infoPath, 'utf8');
    const projectId = /export const projectId = "([^"]+)"/.exec(txt)?.[1];
    const publicAnonKey = /export const publicAnonKey = "([^"]+)"/.exec(txt)?.[1];
    if (!projectId || !publicAnonKey) throw new Error('Failed to read Supabase info.tsx');

    const base = `https://${projectId}.supabase.co/functions/v1/make-server-f04930f2`;

    // Generate a unique test email each run
    const testEmail = `admin+${Date.now()}@exam.com`;

    // 1) Signup admin (unique email)
    const r = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'admin123', name: 'Super Admin', role: 'super_admin' }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(`signup failed: ${r.status} ${JSON.stringify(j)}`);
    }

    // 2) Sign in to get access token
    const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: testEmail, password: 'admin123'
    });
    if (signInErr) throw signInErr;
    const token = signInData.session?.access_token;
    if (!token) throw new Error('No access token');

    const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 3) Create question
    const qRes = await fetch(`${base}/questions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        question: 'What is 2 + 2?',
        type: 'multiple-choice',
        options: ['3','4','5','6'],
        correctAnswer: '4',
        category: 'Math',
        difficulty: 'easy',
        points: 1,
      }),
    });
    const qJson = await qRes.json();
    if (!qRes.ok) throw new Error(`create question failed: ${JSON.stringify(qJson)}`);
    const q1id = qJson.question.id;

    // 4) List questions
    const listQ = await fetch(`${base}/questions`, { headers: { Authorization: `Bearer ${token}` } });
    const listQJson = await listQ.json();
    if (!listQ.ok) throw new Error(`list questions failed: ${JSON.stringify(listQJson)}`);

    // 5) Create exam (with the single question)
    const eRes = await fetch(`${base}/exams`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Quick Demo Exam',
        description: 'Auto-created by live test',
        duration: 10,
        totalMarks: 1,
        passingMarks: 1,
        questionIds: [q1id],
        status: 'published',
        settings: {
          randomizeQuestions: true,
          randomizeOptions: true,
          showResults: true,
          allowReview: true,
          antiCheat: {
            enabled: true,
            detectTabSwitch: true,
            detectCopyPaste: true,
            fullscreenRequired: false,
          },
        },
      }),
    });
    const eJson = await eRes.json();
    if (!eRes.ok) throw new Error(`create exam failed: ${JSON.stringify(eJson)}`);

    // 6) List exams
    const listE = await fetch(`${base}/exams`, { headers: { Authorization: `Bearer ${token}` } });
    const listEJson = await listE.json();
    if (!listE.ok) throw new Error(`list exams failed: ${JSON.stringify(listEJson)}`);

    // Summary
    const out = {
      signup: 'ok_or_exists',
      createdQuestionId: q1id,
      totalQuestions: listQJson.questions?.length ?? 0,
      createdExamId: eJson.exam?.id,
      totalExams: listEJson.exams?.length ?? 0,
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('LIVE_TEST_ERROR', err?.message || err);
    process.exit(1);
  }
})();
