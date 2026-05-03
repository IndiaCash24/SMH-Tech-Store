import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  getDocs, 
  query, 
  where,
  runTransaction,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../components/firebase';
import { Project, Review } from '../types';

const PROJECTS_COLLECTION = 'projects';
const REVIEWS_SUBCOLLECTION = 'reviews';

export const projectService = {
  // Connection check
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  // Projects
  subscribeToProjects(callback: (projects: Project[]) => void) {
    const q = collection(db, PROJECTS_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    }, (error) => handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION));
  },

  async seedProjects(projects: Project[]) {
    try {
      for (const project of projects) {
        const { reviews, ...projectData } = project;
        const projectRef = doc(db, PROJECTS_COLLECTION, project.id);
        await setDoc(projectRef, projectData);
        
        // Seed reviews if any
        if (reviews && reviews.length > 0) {
          for (const review of reviews) {
            const reviewRef = doc(projectRef, REVIEWS_SUBCOLLECTION, review.id);
            await setDoc(reviewRef, review);
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PROJECTS_COLLECTION);
    }
  },

  // Reviews
  subscribeToReviews(projectId: string, callback: (reviews: Review[]) => void) {
    const q = collection(db, PROJECTS_COLLECTION, projectId, REVIEWS_SUBCOLLECTION);
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      callback(reviews);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `${PROJECTS_COLLECTION}/${projectId}/${REVIEWS_SUBCOLLECTION}`));
  },

  async addReview(projectId: string, review: Omit<Review, 'id'>) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const reviewId = Date.now().toString();
    const reviewRef = doc(projectRef, REVIEWS_SUBCOLLECTION, reviewId);

    try {
      await runTransaction(db, async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists()) throw new Error("Project does not exist!");

        const currentData = projectDoc.data() as Project;
        const newRatingCount = (currentData.ratingCount || 0) + 1;
        const totalRating = ((currentData.rating || 0) * (currentData.ratingCount || 0)) + review.rating;
        const newRating = Number((totalRating / newRatingCount).toFixed(1));

        transaction.set(reviewRef, { ...review, id: reviewId });
        transaction.update(projectRef, {
          rating: newRating,
          ratingCount: newRatingCount
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${PROJECTS_COLLECTION}/${projectId}/${REVIEWS_SUBCOLLECTION}`);
    }
  },

  async updateLikes(projectId: string, incrementValue: number) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    try {
      await updateDoc(projectRef, {
        likes: increment(incrementValue)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, PROJECTS_COLLECTION);
    }
  },

  async createProject(project: Omit<Project, 'id' | 'rating' | 'ratingCount' | 'likes'>) {
    const projectId = Date.now().toString();
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const newProject: Project = {
      ...project,
      id: projectId,
      rating: 0,
      ratingCount: 0,
      likes: 0
    };

    try {
      await setDoc(projectRef, newProject);
      return projectId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PROJECTS_COLLECTION);
    }
  },

  async deleteProject(projectId: string) {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    try {
      await deleteDoc(projectRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, PROJECTS_COLLECTION);
    }
  }
};
