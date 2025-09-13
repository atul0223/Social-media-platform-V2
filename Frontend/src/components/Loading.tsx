import { useContext } from "react";
import UserContext from "../context/UserContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
export default function Loading() {
  const { loading }: any = useContext(UserContext);

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center cursor-progress">
        <DotLottieReact
          src="https://lottie.host/a995e850-fbd6-43fd-b7c9-dd250728fdec/rKpexJWARH.lottie"
          loop
          autoplay
          className="w-70 h-60 "
        />
      </div>
    );
}
