import { 
  getAuth, 
  signInWithPopup, 
  OAuthProvider, 
  onAuthStateChanged 
} from "firebase/auth";

const auth = getAuth();

const provider = new OAuthProvider('oidc.discord');
// 유저의 가입 서버 목록을 볼 수 있는 권한을 추가로 요청합니다.
provider.addScope('guilds');
provider.addScope('email');

export const loginWithDiscord = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // [중요] 토큰 추출 방식 확인
    const accessToken = result._tokenResponse?.oauthAccessToken;
    
    return {
      user: result.user,
      accessToken: accessToken
    };
  } catch (error) {
    console.error("디스코드 로그인 에러:", error);
    throw error;
  }
};

export const loginWithDiscordRedirect = async () => {
  try {
    // 이 함수가 실행되면 현재 창이 디스코드 인증 페이지로 이동하며,
    // 기기에 앱이 있다면 자동으로 앱이 열립니다.
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("디스코드 리다이렉트 에러:", error);
    throw error;
  }
};

export const logout = () => auth.signOut();