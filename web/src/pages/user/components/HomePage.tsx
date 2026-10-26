import { Link } from "react-router-dom";
import { profilePageUrl } from "@/endpoints/endpoints";
export default function HomePage(){
    return(
        <div>
            Hello user!
            <Link to={profilePageUrl} className="ml-4 text-blue-700 underline">My Profile</Link>
        </div>
    )
}
