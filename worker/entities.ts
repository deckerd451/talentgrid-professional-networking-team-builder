import { IndexedEntity } from "./core-utils";
import type { Profile } from "@shared/types";
// PROFILE ENTITY: one DO instance per user profile
export class ProfileEntity extends IndexedEntity<Profile> {
  static readonly entityName = "profile";
  static readonly indexName = "profiles";
  static readonly initialState: Profile = { 
    id: "", 
    firstName: "", 
    lastName: "", 
    email: "", 
    photoUrl: "",
    availability: 'Available',
    skills: [],
    createdAt: 0,
  };
}