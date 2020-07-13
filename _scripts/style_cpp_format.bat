
@ECHO OFF

ECHO Running clang-format...

WHERE clang-format
IF %ERRORLEVEL% NEQ 0 (
  ECHO E: clang-format not found! At least not in the PATH...
) ELSE (
  ECHO clang-format found
  clang-format -i -style=file -verbose ../core/src/*.hpp ../core/src/*.h ../core/src/*.cpp ../core/*.h ../core/*.cpp

  ECHO Done
)

pause
