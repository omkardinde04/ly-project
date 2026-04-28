export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
}

export interface EducationInfo {
  degree: string;
  college: string;
  year: string;
  cgpa: string;
}

export interface ExperienceInfo {
  internship: string;
  project: string;
  role: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string;
  link?: string;
  reportFileName?: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  education: EducationInfo;
  skills: string[];
  experience: ExperienceInfo;
  projects: ProjectItem[];
}

export const initialResumeData: ResumeData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
  },
  education: {
    degree: "",
    college: "",
    year: "",
    cgpa: ""
  },
  skills: [],
  experience: {
    internship: "",
    project: "",
    role: ""
  },
  projects: []
};

export type ThemeType = 'minimal' | 'soft' | 'student';
