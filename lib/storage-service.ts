// IndexedDB wrapper for file storage

export interface StorageFile {
  path: string
  projectId: string
  content: string
  lastModified: number
}

export interface StorageProject {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

class StorageService {
  private readonly DB_NAME = "web-editor-files"
  private readonly DB_VERSION = 1
  private readonly STORE_NAME = "files"
  private readonly PROJECT_KEY = "web-editor-projects"

  // Open IndexedDB connection
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: "path" })
          objectStore.createIndex("projectId", "projectId", { unique: false })
        }
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  // Get all projects
  async getProjects(): Promise<StorageProject[]> {
    const storedProjects = localStorage.getItem(this.PROJECT_KEY)
    return storedProjects ? JSON.parse(storedProjects) : []
  }

  // Get a project by ID
  async getProject(id: string): Promise<StorageProject | null> {
    const projects = await this.getProjects()
    return projects.find((p) => p.id === id) || null
  }

  // Save a project
  async saveProject(project: StorageProject): Promise<void> {
    const projects = await this.getProjects()
    const index = projects.findIndex((p) => p.id === project.id)

    if (index >= 0) {
      projects[index] = project
    } else {
      projects.push(project)
    }

    localStorage.setItem(this.PROJECT_KEY, JSON.stringify(projects))
  }

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects()
    const updatedProjects = projects.filter((p) => p.id !== id)
    localStorage.setItem(this.PROJECT_KEY, JSON.stringify(updatedProjects))

    // Delete all files for this project
    const db = await this.openDB()
    const transaction = db.transaction([this.STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(this.STORE_NAME)
    const index = objectStore.index("projectId")
    const keyRange = IDBKeyRange.only(id)

    return new Promise((resolve, reject) => {
      const request = index.openCursor(keyRange)

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          objectStore.delete(cursor.primaryKey)
          cursor.continue()
        }
      }

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }

  // Get all files for a project
  async getFiles(projectId: string): Promise<StorageFile[]> {
    const db = await this.openDB()
    const transaction = db.transaction([this.STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(this.STORE_NAME)
    const index = objectStore.index("projectId")

    return new Promise((resolve, reject) => {
      const request = index.getAll(projectId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Get a file by path
  async getFile(path: string): Promise<StorageFile | null> {
    const db = await this.openDB()
    const transaction = db.transaction([this.STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(this.STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = objectStore.get(path)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Save a file
  async saveFile(file: StorageFile): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(this.STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = objectStore.put(file)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Delete a file
  async deleteFile(path: string): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(this.STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = objectStore.delete(path)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }
}

// Export as singleton
export const storageService = new StorageService()

