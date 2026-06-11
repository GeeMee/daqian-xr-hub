import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { ossImg } from '../../lib/image'

export function SettingsPage() {
  const [brand, setBrand] = useState({ brandName: '', logo: '', slogan: '', phone: '' })
  const [store, setStore] = useState({ storeName: '', address: '', businessHours: '' })

  useEffect(() => {
    api.settings.get().then((data) => {
      setBrand({ brandName: data.brandName, logo: data.logo, slogan: data.slogan, phone: data.phone })
      setStore({ storeName: data.storeName, address: data.address, businessHours: data.businessHours })
    })
  }, [])

  const handleSave = async () => {
    await api.settings.update({ ...brand, ...store })
    alert('保存成功')
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">基础信息管理</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">品牌信息设置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品牌名称</label>
              <input value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品牌LOGO</label>
              <div className="flex items-center gap-4">
                {brand.logo && <img src={ossImg(brand.logo, 160)} alt="" className="w-16 h-16 rounded object-cover" />}
                <label className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  上传图片
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const { url } = await api.upload(file)
                      setBrand({ ...brand, logo: url })
                    }
                  }} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
              <input value={brand.slogan} onChange={(e) => setBrand({ ...brand, slogan: e.target.value })} maxLength={50} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">客服电话</label>
              <input value={brand.phone} onChange={(e) => setBrand({ ...brand, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">门店信息设置</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">门店名称</label>
              <input value={store.storeName} onChange={(e) => setStore({ ...store, storeName: e.target.value })} maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">门店地址</label>
              <input value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} maxLength={100} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">营业时间</label>
              <input value={store.businessHours} onChange={(e) => setStore({ ...store, businessHours: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="mt-6 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">保存</button>
    </div>
  )
}
