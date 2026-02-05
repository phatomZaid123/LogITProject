import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ComplaintsContext = createContext();
const STORAGE_KEY = "logit:complaints:threads";

const generateId = (prefix = "cmp") => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const seedThreads = [
  {
    id: "CMP-2401",
    subject: "Intern weekly reports cannot be submitted",
    category: "Timesheet",
    priority: "high",
    status: "awaiting-company",
    channel: "Portal",
    tags: ["timesheet", "blocking"],
    createdAt: "2026-01-26T09:32:00.000Z",
    updatedAt: "2026-02-02T07:10:00.000Z",
    company: {
      id: "seed-company-kinetic",
      name: "Kinetic Pulse Studio",
      contact: "Mara Dimalanta",
      email: "mara@kineticpulse.com",
    },
    assignedDean: "Dr. Mae Reyes",
    sla: { targetHours: 24, elapsedHours: 14, breached: false },
    messages: [
      {
        id: generateId("msg"),
        authorRole: "company",
        authorName: "Mara Dimalanta",
        body:
          "Our interns cannot submit their week 5 reports because the submission window throws a locked state.",
        timestamp: "2026-01-26T09:32:00.000Z",
      },
      {
        id: generateId("msg"),
        authorRole: "dean",
        authorName: "Dr. Mae Reyes",
        body:
          "We pushed a patch to reopen week 5. Please ask interns to refresh and retry.",
        timestamp: "2026-01-26T10:05:00.000Z",
      },
      {
        id: generateId("msg"),
        authorRole: "company",
        authorName: "Mara Dimalanta",
        body: "Two interns are still locked because of pending timesheet approvals.",
        timestamp: "2026-02-02T07:10:00.000Z",
      },
    ],
    auditTrail: [
      {
        id: generateId("evt"),
        label: "Complaint created",
        timestamp: "2026-01-26T09:32:00.000Z",
        actor: "Mara Dimalanta",
      },
      {
        id: generateId("evt"),
        label: "Status moved to awaiting-company",
        timestamp: "2026-01-26T10:05:00.000Z",
        actor: "System",
      },
    ],
  },
  {
    id: "CMP-2405",
    subject: "Need confirmation on extended OJT hours",
    category: "Policy",
    priority: "medium",
    status: "awaiting-dean",
    channel: "Email",
    tags: ["policy", "clarification"],
    createdAt: "2026-01-28T13:45:00.000Z",
    updatedAt: "2026-01-29T08:11:00.000Z",
    company: {
      id: "seed-company-nimbus",
      name: "Nimbus Analytics",
      contact: "Harvey Lin",
      email: "harvey@nimbusanalytics.co",
    },
    assignedDean: null,
    sla: { targetHours: 48, elapsedHours: 22, breached: false },
    messages: [
      {
        id: generateId("msg"),
        authorRole: "company",
        authorName: "Harvey Lin",
        body:
          "We would like to extend two interns for 60 additional hours. Does the dean's office need a new MOU?",
        timestamp: "2026-01-28T13:45:00.000Z",
      },
      {
        id: generateId("msg"),
        authorRole: "dean",
        authorName: "Dean Secretariat",
        body:
          "Please share their updated schedules. Once received we can issue an addendum letter.",
        timestamp: "2026-01-29T08:11:00.000Z",
      },
    ],
    auditTrail: [
      {
        id: generateId("evt"),
        label: "Complaint created",
        timestamp: "2026-01-28T13:45:00.000Z",
        actor: "Harvey Lin",
      },
    ],
  },
  {
    id: "CMP-2412",
    subject: "Reset needed for rejected student attendance",
    category: "Attendance",
    priority: "low",
    status: "resolved",
    channel: "Portal",
    tags: ["attendance", "resolved"],
    createdAt: "2026-01-20T08:20:00.000Z",
    updatedAt: "2026-01-22T17:03:00.000Z",
    company: {
      id: "seed-company-aurora",
      name: "Aurora Digital",
      contact: "Izzy Cen",
      email: "izzy@auroradigital.one",
    },
    assignedDean: "Dean Secretariat",
    sla: { targetHours: 24, elapsedHours: 50, breached: true },
    messages: [
      {
        id: generateId("msg"),
        authorRole: "company",
        authorName: "Izzy Cen",
        body: "Attendance entries were rejected after we edited the shift duration.",
        timestamp: "2026-01-20T08:20:00.000Z",
      },
      {
        id: generateId("msg"),
        authorRole: "dean",
        authorName: "Dean Secretariat",
        body: "We reset their attendance counters and re-enabled editing.",
        timestamp: "2026-01-22T17:03:00.000Z",
      },
    ],
    auditTrail: [
      {
        id: generateId("evt"),
        label: "Complaint resolved",
        timestamp: "2026-01-22T17:03:00.000Z",
        actor: "Dean Secretariat",
      },
    ],
  },
];

const readThreads = () => {
  if (typeof window === "undefined") return seedThreads;

  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : seedThreads;
  } catch (error) {
    console.warn("Unable to read stored complaints", error);
    return seedThreads;
  }
};

export const ComplaintsProvider = ({ children }) => {
  const [threads, setThreads] = useState(readThreads);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  const mutateThread = useCallback((threadId, mutator) => {
    if (!threadId) return null;

    let nextThread = null;
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        nextThread = mutator(thread);
        return nextThread;
      })
    );
    return nextThread;
  }, []);

  const createComplaint = useCallback((payload) => {
    const timestamp = new Date().toISOString();
    const newThread = {
      id: `CMP-${String(Date.now()).slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority,
      status: "awaiting-dean",
      channel: payload.channel || "Portal",
      tags: payload.tags || [payload.category.toLowerCase()],
      createdAt: timestamp,
      updatedAt: timestamp,
      company: payload.company,
      assignedDean: null,
      sla: payload.sla || { targetHours: 24, elapsedHours: 0, breached: false },
      attachments: payload.attachments || [],
      messages: [
        {
          id: generateId("msg"),
          authorRole: "company",
          authorName: payload.company?.contact || payload.company?.name || "Company",
          body: payload.details,
          attachments: payload.attachments || [],
          timestamp,
        },
      ],
      auditTrail: [
        {
          id: generateId("evt"),
          label: "Complaint created",
          timestamp,
          actor: payload.company?.contact || payload.company?.name || "Company",
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    return newThread;
  }, []);

  const addMessage = useCallback((threadId, payload) => {
    const timestamp = payload.timestamp || new Date().toISOString();

    return mutateThread(threadId, (thread) => {
      const derivedStatus =
        payload.authorRole === "company"
          ? "awaiting-dean"
          : payload.authorRole === "dean"
          ? "awaiting-company"
          : thread.status;

      const entry = {
        id: generateId("msg"),
        authorRole: payload.authorRole,
        authorName: payload.authorName,
        body: payload.body,
        attachments: payload.attachments || [],
        timestamp,
      };

      return {
        ...thread,
        messages: [...thread.messages, entry],
        updatedAt: timestamp,
        status: payload.overrideStatus || derivedStatus,
      };
    });
  }, [mutateThread]);

  const updateStatus = useCallback((threadId, status, actor = "System") => {
    const timestamp = new Date().toISOString();

    return mutateThread(threadId, (thread) => ({
      ...thread,
      status,
      updatedAt: timestamp,
      auditTrail: [
        ...(thread.auditTrail || []),
        {
          id: generateId("evt"),
          label: `Status moved to ${status}`,
          timestamp,
          actor,
        },
      ],
    }));
  }, [mutateThread]);

  const assignOwner = useCallback((threadId, deanName) => {
    return mutateThread(threadId, (thread) => ({
      ...thread,
      assignedDean: deanName,
    }));
  }, [mutateThread]);

  const value = useMemo(
    () => ({ threads, createComplaint, addMessage, updateStatus, assignOwner }),
    [threads, createComplaint, addMessage, updateStatus, assignOwner]
  );

  return <ComplaintsContext.Provider value={value}>{children}</ComplaintsContext.Provider>;
};

export const useComplaints = () => {
  const contextValue = useContext(ComplaintsContext);
  if (!contextValue) {
    throw new Error("useComplaints must be used within ComplaintsProvider");
  }

  return contextValue;
};
