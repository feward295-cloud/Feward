import React from 'react';
import GoogleLogin from 'react-google-login'

function App() {
    const responseGoogle = (response) => {
        console.log(response);
    };

  return (
    <div className="container">
        <GoogleLogin
            clientId="90419304365-eqtlgu03c3vp8vbjrtgffdme2v2ap5t2.apps.googleusercontent.com"
            buttonText="Login with Google"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
            />
      <h1>Hello, World!</h1>
      <button onClick={() => alert('Button clicked!')}>
        Click Me
      </button>
    </div>
  );
}

export default App;