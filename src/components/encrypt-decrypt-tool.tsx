import JsonView from '@uiw/react-json-view';
import CryptoJS from 'crypto-js';
import { useState } from 'react';
import Toast from './Toast';
import './encryp-decrypt-tool.css';

const EncryptDecryptTool = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [secretKey, setSecretKey] = useState('Generali@EDMAPI#');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

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



  const handleCopy = async () => {
    try {
      let textToCopy = outputText;
      
      // Nếu là JSON, format đẹp hơn
      if (isValidJson(outputText)) {
        textToCopy = JSON.stringify(JSON.parse(outputText), null, 2);
      }
      
      await navigator.clipboard.writeText(textToCopy);
      
      // Hiển thị toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Lỗi khi copy:', err);
    }
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
    <div className="encrypt-tool-container">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="header-title">
            🔐 Công cụ Mã hóa/Giải mã
          </h1>
          <p className="header-subtitle">
            Sử dụng AES-256 để mã hóa và giải mã văn bản của bạn một cách an toàn
          </p>
        </div>

        <div className="grid-layout">
          {/* Left Column - Input Form */}
          <div className="config-card">
            <h2 className="text-2xl font-semibold mb-6 flex-center">
              <span className="mr-2">⚙️</span>
              Cấu hình
            </h2>
            
            <div className="mb-6">
              <label htmlFor="secretKey" className="block text-sm font-semibold mb-3">
                🔑 Khóa bí mật
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="secret-key-input"
                  placeholder="Nhập khóa bí mật của bạn..."
                />
                <div className="absolute inset-y-0 right-0 flex-center pr-4">
                  <div className="status-indicator status-green"></div>
                </div>
              </div>
              <p className="mt-3 text-xs flex-center">
                <span className="mr-1">💡</span>
                <span>Sử dụng cùng một khóa bí mật để mã hóa và giải mã dữ liệu</span>
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="inputText" className="block text-sm font-semibold mb-3">
                📝 Văn bản đầu vào
              </label>
              <div className="relative">
                <textarea
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={10}
                  className="text-input rows-10"
                  placeholder="Nhập văn bản, JSON hoặc dữ liệu cần mã hóa/giải mã..."
                />
                <div className="absolute top-3 right-3">
                  {inputText && (
                    <div className={`format-badge ${
                      isValidJson(inputText) 
                        ? 'format-badge-json' 
                        : 'format-badge-text'
                    }`}>
                      {isValidJson(inputText) ? '✓ JSON' : '📄 Text'}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex-wrap gap-2 text-xs flex">
                <span className="flex-center">
                  <span className="status-indicator status-green"></span>
                  Hỗ trợ JSON format
                </span>
                <span className="flex-center">
                  <span className="status-indicator status-blue"></span>
                  Plain text
                </span>
                <span className="flex-center">
                  <span className="status-indicator status-purple"></span>
                  Base64 encoded
                </span>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <div className="flex">
                  <span className="mr-2">❌</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="flex-col justify-between gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="btn-clear"
              >
                🗑️ Xóa
              </button>
              <div className="flex-gap">
                <button
                  type="button"
                  onClick={handleEncrypt}
                  className="btn-encrypt"
                >
                  🔒 Mã hóa
                </button>
                <button
                  type="button"
                  onClick={handleDecrypt}
                  className="btn-decrypt"
                >
                  🔓 Giải mã
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Output Result */}
          <div className="result-card">
            <div className="result-header">
              <div className="flex-between">
                <h2 className="text-2xl font-semibold flex-center">
                  <span className="mr-2">📋</span>
                  Kết quả
                </h2>
                {outputText && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn-copy"
                  >
                    📋 Sao chép
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {outputText ? (
                <div className="space-y-4">
                  {/* Result Type Indicator */}
                  <div className="flex-between">
                    <div className={`format-badge ${
                      isValidJson(outputText) 
                        ? 'format-badge-json' 
                        : 'format-badge-gray'
                    }`}>
                      {isValidJson(outputText) ? '🎯 JSON Format' : '📝 Text Format'}
                    </div>
                    <div className="text-xs">
                      {outputText.length} ký tự
                    </div>
                  </div>
                  
                  {/* JSON Viewer or Text Display */}
                  <div className="output-container">
                    {isValidJson(outputText) ? (
                      <div className="json-viewer">
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
                      <div className="text-output">
                        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-mono">
                          {outputText}
                        </pre>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <h3 className="empty-state-title">Kết quả sẽ hiển thị ở đây</h3>
                  <p className="empty-state-description">
                    Nhập văn bản hoặc JSON vào ô bên trái, sau đó nhấn <strong>Mã hóa</strong> hoặc <strong>Giải mã</strong> để xem kết quả
                  </p>
                  <div className="mt-6 justify-center space-x-4 text-xs flex">
                    <span className="flex-center">
                      <span className="status-indicator status-blue"></span>
                      AES-256 Encryption
                    </span>
                    <span className="flex-center">
                      <span className="status-indicator status-green"></span>
                      JSON Support
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        <Toast 
          show={showToast} 
          message="Đã sao chép thành công!" 
          type="success" 
        />
      </div>
    </div>
  );
};

export default EncryptDecryptTool;
