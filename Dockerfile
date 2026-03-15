# استخدام نسخة Node.js حديثة تتوافق مع مشروعك
FROM node:20

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الإعدادات أولاً لتسريع البناء
COPY package*.json ./

# تثبيت كافة المكتبات (بما فيها tsx و typescript)
RUN npm install

# نسخ بقية ملفات المشروع
COPY . .

# بناء مشروع Next.js
RUN npm run build

# كشف المنفذ الذي يستخدمه السيرفر (3000 افتراضياً في كودك)
EXPOSE 3000

# تشغيل السيرفر باستخدام الأمر المعرف في package.json
CMD ["npm", "run", "start"]
