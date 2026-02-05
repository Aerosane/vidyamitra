@echo off
set GIT_TERMINAL_PROMPT=0
echo Starting Push Process... > push_log.txt

echo Cloning vidyamitra... >> push_log.txt
if exist vidyamitra_clone rd /s /q vidyamitra_clone
git clone https://github.com/Aerosane/vidyamitra.git vidyamitra_clone >> push_log.txt 2>&1

if not exist vidyamitra_clone (
    echo FAILED: Clone failed. >> push_log.txt
    exit /b 1
)

echo Creating frontend directory... >> push_log.txt
if not exist vidyamitra_clone\frontend mkdir vidyamitra_clone\frontend

echo Copying files to vidyamitra_clone\frontend... >> push_log.txt
robocopy . vidyamitra_clone\frontend /E /XD .git node_modules .next vidyamitra_clone vidyamitra_temp vidyamitra_final /XF push_log.txt git_diag.bat git_diag_log.txt git_log.txt output_test.txt test_file.txt >> push_log.txt 2>&1

echo Committing and Pushing... >> push_log.txt
cd vidyamitra_clone
git add . >> ..\push_log.txt 2>&1
git commit -m "Update frontend with project files and pitch report" >> ..\push_log.txt 2>&1
git push origin main >> ..\push_log.txt 2>&1

echo Finished. >> ..\push_log.txt
