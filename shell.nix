{ pkgs ? import <nixpkgs> { } }:

let
  pythonEnv = pkgs.python312.withPackages (ps: with ps; [
    fastapi
    uvicorn
    httpx
    openpyxl
  ]);
in
pkgs.mkShell {
  buildInputs = [
    pythonEnv
    pkgs.nodejs_20
    pkgs.curl
    pkgs.jq
  ];

  shellHook = ''
    echo "Dashboard Mieszkaniowy Polski - dev environment by grupka.pl"
    echo "Python: $(python3 --version)"
    echo "Node:   $(node --version)"
    echo ""
    echo "Backend:  cd backend && uvicorn main:app --reload"
    echo "Frontend: cd frontend && npm install && npm run dev"
  '';
}
