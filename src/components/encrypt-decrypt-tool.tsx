import JsonView from '@uiw/react-json-view';
import CryptoJS from 'crypto-js';
import { useState } from 'react';

const EncryptDecryptTool = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [secretKey, setSecretKey] = useState('Generali@EDMAPI#');
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    try {
      if (!inputText.trim()) {
        setError('Vui lòng nhập văn bản cần mã hóa');
        return;
      }
      
      if (!secretKey.trim()) {
        setError('Vui lòng nhập khóa bí mật');
        return;
      }
      
      // Parse key như trong Angular service
      const key = CryptoJS.enc.Utf8.parse(secretKey);
      
      // Thử parse JSON, nếu không thành công thì dùng như string
      let textToEncrypt;
      try {
        JSON.parse(inputText.trim());
        textToEncrypt = inputText.trim();
      } catch {
        textToEncrypt = inputText.trim();
      }
      
      // Encrypt với mode ECB và padding PKCS7
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(textToEncrypt), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Trả về ciphertext dưới dạng Base64
      const result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      setOutputText(result);
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError('Đã xảy ra lỗi khi mã hóa: ' + err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định khi mã hóa.');
      }
    }
  };

  const handleDecrypt = () => {
    try {
      if (!inputText.trim()) {
        setError('Vui lòng nhập văn bản cần giải mã');
        return;
      }
      
      if (!secretKey.trim()) {
        setError('Vui lòng nhập khóa bí mật');
        return;
      }
      
      // Parse key như trong Angular service
      const key = CryptoJS.enc.Utf8.parse(secretKey);
      
      // Loại bỏ khoảng trắng
      const cleanedInput = inputText.replace(/\s+/g, '');
      
      // Kiểm tra định dạng Base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(cleanedInput)) {
        setError('Định dạng văn bản mã hóa không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }
      
      // Tạo CipherParams object từ chuỗi Base64
      const wordArray = CryptoJS.enc.Base64.parse(cleanedInput);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: wordArray
      });
      
      // Thực hiện giải mã với mode ECB và padding PKCS7
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Chuyển đổi kết quả thành chuỗi UTF-8
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Không thể giải mã. Khóa bí mật có thể không chính xác.');
      }
      
      // Thử parse JSON để format đẹp hơn
      try {
        const parsed = JSON.parse(decryptedText);
        if (typeof parsed === 'string') {
          setOutputText(parsed);
        } else {
          setOutputText(JSON.stringify(parsed, null, 2));
        }
      } catch {
        // Nếu không phải JSON, hiển thị như chuỗi thông thường
        setOutputText(decryptedText);
      }
      
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Malformed UTF-8')) {
          setError('Lỗi giải mã: Dữ liệu không hợp lệ hoặc khóa bí mật sai. Vui lòng kiểm tra lại.');
        } else {
          setError('Đã xảy ra lỗi khi giải mã: ' + err.message);
        }
      } else {
        setError('Đã xảy ra lỗi không xác định khi giải mã.');
      }
    }
  };



  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  // Function to check if text is valid JSON
  const isValidJson = (text: string) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🔐 Công cụ Mã hóa/Giải mã
          </h1>
          <p className="text-lg text-gray-600">
            Sử dụng AES-256 để mã hóa và giải mã văn bản của bạn một cách an toàn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">⚙️</span>
              Cấu hình
            </h2>
            
            <div className="mb-6">
              <label htmlFor="secretKey" className="block text-sm font-semibold text-gray-700 mb-3">
                🔑 Khóa bí mật
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gradient-to-r from-white to-gray-50 hover:border-gray-400 text-sm md:text-base"
                  placeholder="Nhập khóa bí mật của bạn..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 flex items-center">
                <span className="mr-1">💡</span>
                <span>Sử dụng cùng một khóa bí mật để mã hóa và giải mã dữ liệu</span>
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="inputText" className="block text-sm font-semibold text-gray-700 mb-3">
                📝 Văn bản đầu vào
              </label>
              <div className="relative">
                <textarea
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gradient-to-br from-white to-gray-50 hover:border-gray-400 font-mono text-sm md:text-base resize-none"
                  placeholder="Nhập văn bản, JSON hoặc dữ liệu cần mã hóa/giải mã..."
                />
                <div className="absolute top-3 right-3">
                  {inputText && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isValidJson(inputText) 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {isValidJson(inputText) ? '✓ JSON' : '📄 Text'}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Hỗ trợ JSON format
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  Plain text
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                  Base64 encoded
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md">
                <div className="flex">
                  <span className="mr-2">❌</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border-2 border-rose-200 rounded-lg shadow-sm text-sm font-medium text-rose-600 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-300 transition-all duration-200"
              >
                🗑️ Xóa
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleEncrypt}
                  className="min-w-[150px] flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200"
                >
                  🔒 Mã hóa
                </button>
                <button
                  type="button"
                  onClick={handleDecrypt}
                  className="min-w-[150px] flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-200"
                >
                  🔓 Giải mã
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Output Result */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>
                  Kết quả
                </h2>
                {outputText && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    📄 Sao chép
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {outputText ? (
                <div className="space-y-4">
                  {/* Result Type Indicator */}
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isValidJson(outputText) 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {isValidJson(outputText) ? '🎯 JSON Format' : '📝 Text Format'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {outputText.length} ký tự
                    </div>
                  </div>
                  
                  {/* JSON Viewer or Text Display */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-96">
                    {isValidJson(outputText) ? (
                      <div className="bg-white max-h-96 overflow-y-auto">
                        <JsonView 
                          value={JSON.parse(outputText)}
                          style={{
                            backgroundColor: 'transparent',
                            fontSize: '14px',
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                          }}
                          displayDataTypes={false}
                          displayObjectSize={false}
                          enableClipboard={false}
                          collapsed={false}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-900 text-gray-100 p-6 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-mono">
                          {outputText}
                        </pre>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      📋 Copy
                    </button>
                    {isValidJson(outputText) && (
                      <button
                        onClick={() => {
                          const formatted = JSON.stringify(JSON.parse(outputText), null, 2);
                          navigator.clipboard.writeText(formatted);
                        }}
                        className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        🎨 Copy Formatted
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-7xl mb-6 animate-pulse">📄</div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Kết quả sẽ hiển thị ở đây</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                    Nhập văn bản hoặc JSON vào ô bên trái, sau đó nhấn <strong>Mã hóa</strong> hoặc <strong>Giải mã</strong> để xem kết quả
                  </p>
                  <div className="mt-6 flex justify-center space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-300 rounded-full mr-1"></span>
                      AES-256 Encryption
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-300 rounded-full mr-1"></span>
                      JSON Support
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptDecryptTool;
